import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'path';
import { APIServer } from '../api/server';
import { AutomationEngine } from '../automation/automation-engine';
import { LLMBridge } from '../bridges/llm-bridge';
import { OCRBridge } from '../bridges/ocr-bridge';
import dotenv from 'dotenv';

dotenv.config();

class BrowserApp {
  private mainWindow: BrowserWindow | null = null;
  private apiServer: APIServer;
  private automationEngine: AutomationEngine;

  constructor() {
    this.apiServer = new APIServer();
    const llmBridge = this.apiServer.getLLMBridge();
    const ocrBridge = this.apiServer.getOCRBridge();
    this.automationEngine = new AutomationEngine(llmBridge, ocrBridge);

    this.setupApp();
    this.setupIPC();
  }

  private setupApp(): void {
    app.on('ready', () => {
      this.createWindow();
      this.apiServer.start();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (this.mainWindow === null) {
        this.createWindow();
      }
    });
  }

  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webviewTag: true,
        webSecurity: false,
      },
      title: 'AI Automation Browser',
      icon: path.join(__dirname, '../../assets/icon.png'),
    });

    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:8080');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' http: https: data: blob:"],
        },
      });
    });
  }

  private setupIPC(): void {
    ipcMain.handle('create-task', async (event, taskData) => {
      try {
        const task = this.apiServer.getTaskManager().createTask(
          taskData.name,
          taskData.description,
          taskData.steps
        );
        return { success: true, data: task };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('get-tasks', async () => {
      try {
        const tasks = this.apiServer.getTaskManager().getAllTasks();
        return { success: true, data: tasks };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('get-task', async (event, taskId) => {
      try {
        const task = this.apiServer.getTaskManager().getTask(taskId);
        return { success: true, data: task };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('update-task', async (event, taskId, updates) => {
      try {
        const task = this.apiServer.getTaskManager().updateTask(taskId, updates);
        return { success: true, data: task };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('delete-task', async (event, taskId) => {
      try {
        const deleted = this.apiServer.getTaskManager().deleteTask(taskId);
        return { success: true, data: { deleted } };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('llm-chat', async (event, request) => {
      try {
        const response = await this.apiServer.getLLMBridge().chat(request);
        return { success: true, data: response };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('llm-analyze', async (event, text, instruction) => {
      try {
        const analysis = await this.apiServer.getLLMBridge().analyzeText(text, instruction);
        return { success: true, data: { analysis } };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('ocr-extract', async (event, request) => {
      try {
        const result = await this.apiServer.getOCRBridge().extractText(request);
        return { success: true, data: result };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('get-task-results', async (event, taskId, limit) => {
      try {
        const results = this.apiServer.getTaskManager().getTaskResults(taskId, limit);
        return { success: true, data: results };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });
  }
}

new BrowserApp();
