import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { TaskManager } from '../tasks/task-manager';
import { LLMBridge } from '../bridges/llm-bridge';
import { OCRBridge } from '../bridges/ocr-bridge';
import { APIResponse, AutomationTask, TaskStatus } from '../types';
import { apiRouter } from './routes';

dotenv.config();

export class APIServer {
  private app: express.Application;
  private taskManager: TaskManager;
  private llmBridge: LLMBridge;
  private ocrBridge: OCRBridge;
  private port: number;

  constructor(port?: number) {
    this.app = express();
    this.port = port || parseInt(process.env.API_PORT || '3000', 10);
    this.taskManager = new TaskManager(process.env.DATABASE_PATH);
    this.llmBridge = new LLMBridge();
    this.ocrBridge = new OCRBridge();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        success: true,
        data: { status: 'healthy', timestamp: new Date() },
        timestamp: new Date(),
      });
    });

    this.app.use('/api', apiRouter(this.taskManager, this.llmBridge, this.ocrBridge));
  }

  private setupErrorHandling(): void {
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Error:', err);
      res.status(500).json({
        success: false,
        error: err.message,
        timestamp: new Date(),
      });
    });
  }

  start(): void {
    this.app.listen(this.port, () => {
      console.log(`API Server running on http://localhost:${this.port}`);
      console.log(`Health check: http://localhost:${this.port}/health`);
    });
  }

  getApp(): express.Application {
    return this.app;
  }

  getTaskManager(): TaskManager {
    return this.taskManager;
  }

  getLLMBridge(): LLMBridge {
    return this.llmBridge;
  }

  getOCRBridge(): OCRBridge {
    return this.ocrBridge;
  }
}

if (require.main === module) {
  const server = new APIServer();
  server.start();
}

export default APIServer;
