import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { AutomationTask, AutomationStep, TaskStatus, AutomationResult } from '../types';
import path from 'path';
import fs from 'fs';

export class TaskManager {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const dataDir = path.dirname(dbPath || './data/browser.db');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new Database(dbPath || './data/browser.db');
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        steps TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        last_run_at INTEGER,
        schedule TEXT
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS task_results (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        status TEXT NOT NULL,
        start_time INTEGER NOT NULL,
        end_time INTEGER,
        outputs TEXT,
        errors TEXT,
        logs TEXT,
        FOREIGN KEY (task_id) REFERENCES tasks (id)
      )
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_task_results_task_id ON task_results(task_id);
    `);
  }

  createTask(name: string, description: string | undefined, steps: AutomationStep[]): AutomationTask {
    const task: AutomationTask = {
      id: uuidv4(),
      name,
      description,
      steps,
      status: TaskStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, name, description, steps, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      task.id,
      task.name,
      task.description || null,
      JSON.stringify(task.steps),
      task.status,
      task.createdAt.getTime(),
      task.updatedAt.getTime()
    );

    return task;
  }

  getTask(id: string): AutomationTask | null {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return this.rowToTask(row);
  }

  getAllTasks(): AutomationTask[] {
    const stmt = this.db.prepare('SELECT * FROM tasks ORDER BY created_at DESC');
    const rows = stmt.all() as any[];

    return rows.map(row => this.rowToTask(row));
  }

  getTasksByStatus(status: TaskStatus): AutomationTask[] {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC');
    const rows = stmt.all(status) as any[];

    return rows.map(row => this.rowToTask(row));
  }

  updateTask(id: string, updates: Partial<AutomationTask>): AutomationTask | null {
    const task = this.getTask(id);
    if (!task) return null;

    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: new Date(),
    };

    const stmt = this.db.prepare(`
      UPDATE tasks
      SET name = ?, description = ?, steps = ?, status = ?, updated_at = ?, last_run_at = ?, schedule = ?
      WHERE id = ?
    `);

    stmt.run(
      updatedTask.name,
      updatedTask.description || null,
      JSON.stringify(updatedTask.steps),
      updatedTask.status,
      updatedTask.updatedAt.getTime(),
      updatedTask.lastRunAt?.getTime() || null,
      updatedTask.schedule || null,
      id
    );

    return updatedTask;
  }

  deleteTask(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  updateTaskStatus(id: string, status: TaskStatus): void {
    const stmt = this.db.prepare('UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?');
    stmt.run(status, Date.now(), id);
  }

  saveTaskResult(result: AutomationResult): void {
    const stmt = this.db.prepare(`
      INSERT INTO task_results (id, task_id, status, start_time, end_time, outputs, errors, logs)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      uuidv4(),
      result.taskId,
      result.status,
      result.startTime.getTime(),
      result.endTime?.getTime() || null,
      JSON.stringify(result.outputs),
      JSON.stringify(result.errors || []),
      JSON.stringify(result.logs)
    );

    this.updateTaskStatus(result.taskId, result.status);
    
    const updateLastRun = this.db.prepare('UPDATE tasks SET last_run_at = ? WHERE id = ?');
    updateLastRun.run(result.startTime.getTime(), result.taskId);
  }

  getTaskResults(taskId: string, limit: number = 10): AutomationResult[] {
    const stmt = this.db.prepare(`
      SELECT * FROM task_results
      WHERE task_id = ?
      ORDER BY start_time DESC
      LIMIT ?
    `);

    const rows = stmt.all(taskId, limit) as any[];

    return rows.map(row => ({
      taskId: row.task_id,
      status: row.status,
      startTime: new Date(row.start_time),
      endTime: row.end_time ? new Date(row.end_time) : undefined,
      outputs: JSON.parse(row.outputs),
      errors: JSON.parse(row.errors),
      logs: JSON.parse(row.logs),
    }));
  }

  private rowToTask(row: any): AutomationTask {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      steps: JSON.parse(row.steps),
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastRunAt: row.last_run_at ? new Date(row.last_run_at) : undefined,
      schedule: row.schedule,
    };
  }

  close(): void {
    this.db.close();
  }
}

export default TaskManager;
