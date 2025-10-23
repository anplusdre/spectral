import { AutomationTask, AutomationStep, AutomationResult, TaskStatus, ActionType } from '../types';
import { LLMBridge } from '../bridges/llm-bridge';
import { OCRBridge } from '../bridges/ocr-bridge';

export interface AutomationPage {
  goto(url: string): Promise<void>;
  click(selector: string): Promise<void>;
  type(selector: string, text: string): Promise<void>;
  waitForSelector(selector: string, timeout?: number): Promise<void>;
  waitForTimeout(timeout: number): Promise<void>;
  evaluate(script: string | Function): Promise<any>;
  screenshot(options?: any): Promise<Buffer>;
  content(): Promise<string>;
  $(selector: string): Promise<any>;
  title(): Promise<string>;
  url(): Promise<string>;
  select(selector: string, value: string): Promise<void>;
}

export class AutomationEngine {
  private llmBridge: LLMBridge;
  private ocrBridge: OCRBridge;
  private variables: Map<string, any>;

  constructor(llmBridge: LLMBridge, ocrBridge: OCRBridge) {
    this.llmBridge = llmBridge;
    this.ocrBridge = ocrBridge;
    this.variables = new Map();
  }

  async executeTask(task: AutomationTask, page: AutomationPage): Promise<AutomationResult> {
    const result: AutomationResult = {
      taskId: task.id,
      status: TaskStatus.RUNNING,
      startTime: new Date(),
      outputs: {},
      logs: [],
      errors: [],
    };

    try {
      result.logs.push(`Starting task: ${task.name}`);
      
      for (const step of task.steps) {
        await this.executeStep(step, page, result);
      }

      result.status = TaskStatus.COMPLETED;
      result.endTime = new Date();
      result.logs.push('Task completed successfully');
    } catch (error: any) {
      result.status = TaskStatus.FAILED;
      result.endTime = new Date();
      result.errors?.push(error.message);
      result.logs.push(`Task failed: ${error.message}`);
    }

    result.outputs = Object.fromEntries(this.variables);
    this.variables.clear();

    return result;
  }

  private async executeStep(step: AutomationStep, page: AutomationPage, result: AutomationResult): Promise<void> {
    result.logs.push(`Executing step: ${step.action}`);

    try {
      switch (step.action) {
        case ActionType.NAVIGATE:
          await this.navigate(step, page);
          break;
        case ActionType.CLICK:
          await this.click(step, page);
          break;
        case ActionType.TYPE:
          await this.typeText(step, page);
          break;
        case ActionType.WAIT:
          await this.wait(step, page);
          break;
        case ActionType.EXTRACT:
          await this.extract(step, page);
          break;
        case ActionType.SCREENSHOT:
          await this.screenshot(step, page);
          break;
        case ActionType.SCROLL:
          await this.scroll(step, page);
          break;
        case ActionType.SELECT:
          await this.selectOption(step, page);
          break;
        case ActionType.EXECUTE_SCRIPT:
          await this.executeScript(step, page);
          break;
        case ActionType.LLM_ANALYZE:
          await this.llmAnalyze(step, page);
          break;
        case ActionType.OCR_EXTRACT:
          await this.ocrExtract(step, page);
          break;
        default:
          throw new Error(`Unknown action type: ${step.action}`);
      }

      result.logs.push(`Step completed: ${step.action}`);
    } catch (error: any) {
      throw new Error(`Step ${step.action} failed: ${error.message}`);
    }
  }

  private async navigate(step: AutomationStep, page: AutomationPage): Promise<void> {
    if (!step.value) throw new Error('Navigate action requires a URL value');
    await page.goto(step.value);
  }

  private async click(step: AutomationStep, page: AutomationPage): Promise<void> {
    if (!step.selector) throw new Error('Click action requires a selector');
    await page.waitForSelector(step.selector, { timeout: 5000 } as any);
    await page.click(step.selector);
  }

  private async typeText(step: AutomationStep, page: AutomationPage): Promise<void> {
    if (!step.selector) throw new Error('Type action requires a selector');
    if (!step.value) throw new Error('Type action requires a value');
    
    await page.waitForSelector(step.selector, { timeout: 5000 } as any);
    await page.type(step.selector, step.value);
  }

  private async wait(step: AutomationStep, page: AutomationPage): Promise<void> {
    if (step.selector) {
      await page.waitForSelector(step.selector, { timeout: step.waitTime || 10000 } as any);
    } else {
      await page.waitForTimeout(step.waitTime || 1000);
    }
  }

  private async extract(step: AutomationStep, page: AutomationPage): Promise<void> {
    if (!step.selector) throw new Error('Extract action requires a selector');
    
    const extractedValue = await page.evaluate((selector: string) => {
      const element = document.querySelector(selector);
      return element ? element.textContent?.trim() : null;
    }, step.selector);

    if (step.outputVariable) {
      this.variables.set(step.outputVariable, extractedValue);
    }
  }

  private async screenshot(step: AutomationStep, page: AutomationPage): Promise<void> {
    const screenshot = await page.screenshot({ encoding: 'base64' } as any);
    
    if (step.outputVariable) {
      this.variables.set(step.outputVariable, screenshot);
    }
  }

  private async scroll(step: AutomationStep, page: AutomationPage): Promise<void> {
    if (step.selector) {
      await page.evaluate((selector: string) => {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, step.selector);
    } else {
      const scrollAmount = parseInt(step.value || '500', 10);
      await page.evaluate((amount: number) => {
        window.scrollBy(0, amount);
      }, scrollAmount);
    }
  }

  private async selectOption(step: AutomationStep, page: AutomationPage): Promise<void> {
    if (!step.selector) throw new Error('Select action requires a selector');
    if (!step.value) throw new Error('Select action requires a value');
    
    await page.select(step.selector, step.value);
  }

  private async executeScript(step: AutomationStep, page: AutomationPage): Promise<void> {
    if (!step.value) throw new Error('ExecuteScript action requires a script value');
    
    const scriptResult = await page.evaluate(step.value);
    
    if (step.outputVariable) {
      this.variables.set(step.outputVariable, scriptResult);
    }
  }

  private async llmAnalyze(step: AutomationStep, page: AutomationPage): Promise<void> {
    const content = await page.content();
    const instruction = step.value || 'Analyze this page content';
    
    const analysis = await this.llmBridge.analyzeText(content, instruction);
    
    if (step.outputVariable) {
      this.variables.set(step.outputVariable, analysis);
    }
  }

  private async ocrExtract(step: AutomationStep, page: AutomationPage): Promise<void> {
    const screenshot = await page.screenshot({ encoding: 'base64' } as any);
    const ocrResult = await this.ocrBridge.extractFromScreenshot(screenshot.toString());
    
    if (step.outputVariable) {
      this.variables.set(step.outputVariable, ocrResult.text);
    }
  }

  getVariable(name: string): any {
    return this.variables.get(name);
  }

  setVariable(name: string, value: any): void {
    this.variables.set(name, value);
  }
}

export default AutomationEngine;
