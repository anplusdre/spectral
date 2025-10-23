export interface LLMRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface OCRRequest {
  imageUrl?: string;
  imageBase64?: string;
  language?: string;
}

export interface OCRResponse {
  text: string;
  confidence: number;
  blocks?: OCRBlock[];
}

export interface OCRBlock {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AutomationTask {
  id: string;
  name: string;
  description?: string;
  steps: AutomationStep[];
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  schedule?: string;
}

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
}

export enum ActionType {
  NAVIGATE = 'navigate',
  CLICK = 'click',
  TYPE = 'type',
  WAIT = 'wait',
  EXTRACT = 'extract',
  SCREENSHOT = 'screenshot',
  SCROLL = 'scroll',
  SELECT = 'select',
  EXECUTE_SCRIPT = 'executeScript',
  LLM_ANALYZE = 'llmAnalyze',
  OCR_EXTRACT = 'ocrExtract',
}

export interface AutomationStep {
  id: string;
  action: ActionType;
  selector?: string;
  value?: string;
  waitTime?: number;
  outputVariable?: string;
  condition?: string;
}

export interface AutomationResult {
  taskId: string;
  status: TaskStatus;
  startTime: Date;
  endTime?: Date;
  outputs: Record<string, any>;
  errors?: string[];
  logs: string[];
}

export interface BrowserTab {
  id: string;
  url: string;
  title: string;
  active: boolean;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}
