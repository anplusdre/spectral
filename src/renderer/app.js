const { ipcRenderer } = require('electron');

class BrowserUI {
  constructor() {
    this.currentTab = 'tab-1';
    this.tabs = new Map();
    this.tasks = [];
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadTasks();
    this.setupWebview();
  }

  setupEventListeners() {
    document.getElementById('backBtn').addEventListener('click', () => this.navigateBack());
    document.getElementById('forwardBtn').addEventListener('click', () => this.navigateForward());
    document.getElementById('refreshBtn').addEventListener('click', () => this.refresh());
    document.getElementById('goBtn').addEventListener('click', () => this.navigate());
    document.getElementById('newTabBtn').addEventListener('click', () => this.createNewTab());
    document.getElementById('urlInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.navigate();
    });

    document.getElementById('newTaskBtn').addEventListener('click', () => this.openTaskModal());
    document.getElementById('cancelTaskBtn').addEventListener('click', () => this.closeTaskModal());
    document.getElementById('taskForm').addEventListener('submit', (e) => this.createTask(e));
  }

  setupWebview() {
    const webview = document.getElementById('webview-1');
    
    webview.addEventListener('did-start-loading', () => {
      this.updateStatus('Loading...');
    });

    webview.addEventListener('did-stop-loading', () => {
      this.updateStatus('Ready');
      document.getElementById('urlInput').value = webview.getURL();
    });

    webview.addEventListener('page-title-updated', (e) => {
      const tab = document.querySelector(`.tab[data-tab-id="${this.currentTab}"]`);
      if (tab) {
        tab.textContent = e.title || 'New Tab';
      }
    });

    webview.addEventListener('did-fail-load', (e) => {
      if (e.errorCode !== -3) {
        this.updateStatus(`Failed to load: ${e.errorDescription}`);
      }
    });
  }

  navigateBack() {
    const webview = this.getCurrentWebview();
    if (webview && webview.canGoBack()) {
      webview.goBack();
    }
  }

  navigateForward() {
    const webview = this.getCurrentWebview();
    if (webview && webview.canGoForward()) {
      webview.goForward();
    }
  }

  refresh() {
    const webview = this.getCurrentWebview();
    if (webview) {
      webview.reload();
    }
  }

  navigate() {
    const url = document.getElementById('urlInput').value;
    const webview = this.getCurrentWebview();
    
    if (webview && url) {
      let finalUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        finalUrl = 'https://' + url;
      }
      webview.src = finalUrl;
    }
  }

  getCurrentWebview() {
    return document.querySelector('.active-webview');
  }

  createNewTab() {
    const tabId = `tab-${Date.now()}`;
    const webviewId = `webview-${Date.now()}`;

    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.dataset.tabId = tabId;
    tab.textContent = 'New Tab';
    tab.addEventListener('click', () => this.switchTab(tabId));

    document.getElementById('tabBar').appendChild(tab);

    const webview = document.createElement('webview');
    webview.id = webviewId;
    webview.src = 'about:blank';
    webview.style.display = 'none';

    document.querySelector('.webview-container').appendChild(webview);

    this.tabs.set(tabId, webviewId);
    this.switchTab(tabId);
  }

  switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.tabId === tabId) {
        tab.classList.add('active');
      }
    });

    document.querySelectorAll('webview').forEach(wv => {
      wv.classList.remove('active-webview');
      wv.style.display = 'none';
    });

    const webviewId = this.tabs.get(tabId) || 'webview-1';
    const webview = document.getElementById(webviewId);
    if (webview) {
      webview.classList.add('active-webview');
      webview.style.display = 'block';
      document.getElementById('urlInput').value = webview.getURL();
    }

    this.currentTab = tabId;
  }

  async loadTasks() {
    try {
      const result = await ipcRenderer.invoke('get-tasks');
      if (result.success) {
        this.tasks = result.data;
        this.renderTasks();
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }

  renderTasks() {
    const taskList = document.getElementById('taskList');
    
    if (this.tasks.length === 0) {
      taskList.innerHTML = `
        <div class="empty-state">
          <p>No tasks yet</p>
          <p style="font-size: 12px; margin-top: 10px;">Create your first automation task</p>
        </div>
      `;
      return;
    }

    taskList.innerHTML = this.tasks.map(task => `
      <div class="task-item" data-task-id="${task.id}">
        <div class="task-name">${task.name}</div>
        <div class="task-status status-${task.status}">${task.status}</div>
        ${task.description ? `<div style="font-size: 12px; color: #aaa; margin-top: 5px;">${task.description}</div>` : ''}
      </div>
    `).join('');

    document.querySelectorAll('.task-item').forEach(item => {
      item.addEventListener('click', () => {
        const taskId = item.dataset.taskId;
        this.selectTask(taskId);
      });
    });
  }

  selectTask(taskId) {
    document.querySelectorAll('.task-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.taskId === taskId) {
        item.classList.add('active');
      }
    });

    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      this.updateStatus(`Selected task: ${task.name}`);
      console.log('Task details:', task);
    }
  }

  openTaskModal() {
    document.getElementById('taskModal').classList.add('active');
  }

  closeTaskModal() {
    document.getElementById('taskModal').classList.remove('active');
    document.getElementById('taskForm').reset();
  }

  async createTask(e) {
    e.preventDefault();

    const name = document.getElementById('taskName').value;
    const description = document.getElementById('taskDescription').value;
    const stepsJson = document.getElementById('taskSteps').value;

    try {
      const steps = JSON.parse(stepsJson);
      
      const result = await ipcRenderer.invoke('create-task', {
        name,
        description,
        steps
      });

      if (result.success) {
        this.closeTaskModal();
        await this.loadTasks();
        this.updateStatus(`Task "${name}" created successfully`);
      } else {
        alert(`Failed to create task: ${result.error}`);
      }
    } catch (error) {
      alert(`Invalid JSON in steps: ${error.message}`);
    }
  }

  updateStatus(message) {
    document.getElementById('statusText').textContent = message;
  }
}

const browserUI = new BrowserUI();
