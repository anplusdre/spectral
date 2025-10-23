import { Router, Request, Response } from 'express';
import { TaskManager } from '../tasks/task-manager';
import { LLMBridge } from '../bridges/llm-bridge';
import { OCRBridge } from '../bridges/ocr-bridge';
import { APIResponse, AutomationTask, TaskStatus, ActionType } from '../types';

export function apiRouter(
  taskManager: TaskManager,
  llmBridge: LLMBridge,
  ocrBridge: OCRBridge
): Router {
  const router = Router();

  router.post('/tasks', async (req: Request, res: Response) => {
    try {
      const { name, description, steps } = req.body;

      if (!name || !steps || !Array.isArray(steps)) {
        return res.status(400).json({
          success: false,
          error: 'Name and steps array are required',
          timestamp: new Date(),
        });
      }

      const task = taskManager.createTask(name, description, steps);

      res.json({
        success: true,
        data: task,
        timestamp: new Date(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
    }
  });

  router.get('/tasks', async (req: Request, res: Response) => {
    try {
      const { status } = req.query;

      let tasks: AutomationTask[];
      if (status) {
        tasks = taskManager.getTasksByStatus(status as TaskStatus);
      } else {
        tasks = taskManager.getAllTasks();
      }

      res.json({
        success: true,
        data: tasks,
        timestamp: new Date(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
    }
  });

  router.get('/tasks/:id', async (req: Request, res: Response) => {
    try {
      const task = taskManager.getTask(req.params.id);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
          timestamp: new Date(),
        });
      }

      res.json({
        success: true,
        data: task,
        timestamp: new Date(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
    }
  });

  router.put('/tasks/:id', async (req: Request, res: Response) => {
    try {
      const { name, description, steps, status } = req.body;
      
      const updates: Partial<AutomationTask> = {};
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (steps) updates.steps = steps;
      if (status) updates.status = status;

      const task = taskManager.updateTask(req.params.id, updates);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
          timestamp: new Date(),
        });
      }

      res.json({
        success: true,
        data: task,
        timestamp: new Date(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
    }
  });

  router.delete('/tasks/:id', async (req: Request, res: Response) => {
    try {
      const deleted = taskManager.deleteTask(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
          timestamp: new Date(),
        });
      }

      res.json({
        success: true,
        data: { deleted: true },
        timestamp: new Date(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
    }
  });

  router.get('/tasks/:id/results', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const results = taskManager.getTaskResults(req.params.id, limit);

      res.json({
        success: true,
        data: results,
        timestamp: new Date(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
    }
  });

  router.post('/llm/chat', async (req: Request, res: Response) => {
    try {
      const { prompt, systemPrompt, model, temperature, maxTokens } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: 'Prompt is required',
          timestamp: new Date(),
        });
      }

      const response = await llmBridge.chat({
        prompt,
        systemPrompt,
        model,
        temperature,
        maxTokens,
      });

      res.json({
        success: true,
        data: response,
        timestamp: new Date(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
    }
  });

  router.post('/llm/analyze', async (req: Request, res: Response) => {
    try {
      const { text, instruction } = req.body;

      if (!text || !instruction) {
        return res.status(400).json({
          success: false,
          error: 'Text and instruction are required',
          timestamp: new Date(),
        });
      }

      const analysis = await llmBridge.analyzeText(text, instruction);

      res.json({
        success: true,
        data: { analysis },
        timestamp: new Date(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
    }
  });

  router.post('/llm/extract', async (req: Request, res: Response) => {
    try {
      const { html, schema } = req.body;

      if (!html || !schema) {
        return res.status(400).json({
          success: false,
          error: 'HTML and schema are required',
          timestamp: new Date(),
        });
      }

      const extractedData = await llmBridge.extractData(html, schema);

      res.json({
        success: true,
        data: extractedData,
        timestamp: new Date(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
    }
  });

  router.post('/llm/generate-steps', async (req: Request, res: Response) => {
    try {
      const { description } = req.body;

      if (!description) {
        return res.status(400).json({
          success: false,
          error: 'Description is required',
          timestamp: new Date(),
        });
      }

      const steps = await llmBridge.generateAutomationSteps(description);

      res.json({
        success: true,
        data: { steps },
        timestamp: new Date(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
    }
  });

  router.post('/ocr/extract', async (req: Request, res: Response) => {
    try {
      const { imageUrl, imageBase64, language } = req.body;

      if (!imageUrl && !imageBase64) {
        return res.status(400).json({
          success: false,
          error: 'Either imageUrl or imageBase64 is required',
          timestamp: new Date(),
        });
      }

      const result = await ocrBridge.extractText({
        imageUrl,
        imageBase64,
        language,
      });

      res.json({
        success: true,
        data: result,
        timestamp: new Date(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
    }
  });

  router.post('/ocr/structured', async (req: Request, res: Response) => {
    try {
      const { imageBase64, fields } = req.body;

      if (!imageBase64 || !fields || !Array.isArray(fields)) {
        return res.status(400).json({
          success: false,
          error: 'imageBase64 and fields array are required',
          timestamp: new Date(),
        });
      }

      const result = await ocrBridge.extractStructuredData(imageBase64, fields);

      res.json({
        success: true,
        data: result,
        timestamp: new Date(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
    }
  });

  return router;
}
