import axios, { AxiosInstance } from 'axios';
import { LLMRequest, LLMResponse } from '../types';

export class LLMBridge {
  private apiKey: string;
  private endpoint: string;
  private defaultModel: string;
  private client: AxiosInstance;

  constructor(apiKey?: string, endpoint?: string, model?: string) {
    this.apiKey = apiKey || process.env.LLM_API_KEY || '';
    this.endpoint = endpoint || process.env.LLM_API_ENDPOINT || 'https://api.openai.com/v1';
    this.defaultModel = model || process.env.LLM_MODEL || 'gpt-4';

    this.client = axios.create({
      baseURL: this.endpoint,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    try {
      const messages: any[] = [];

      if (request.systemPrompt) {
        messages.push({
          role: 'system',
          content: request.systemPrompt,
        });
      }

      messages.push({
        role: 'user',
        content: request.prompt,
      });

      const response = await this.client.post('/chat/completions', {
        model: request.model || this.defaultModel,
        messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2000,
      });

      const choice = response.data.choices[0];
      const usage = response.data.usage;

      return {
        content: choice.message.content,
        usage: usage ? {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        } : undefined,
        model: response.data.model,
      };
    } catch (error: any) {
      throw new Error(`LLM API error: ${error.message}`);
    }
  }

  async analyzeText(text: string, instruction: string): Promise<string> {
    const request: LLMRequest = {
      prompt: `${instruction}\n\nText to analyze:\n${text}`,
      systemPrompt: 'You are a helpful assistant that analyzes text and provides structured insights.',
    };

    const response = await this.chat(request);
    return response.content;
  }

  async extractData(html: string, schema: Record<string, string>): Promise<Record<string, any>> {
    const schemaDescription = Object.entries(schema)
      .map(([key, description]) => `${key}: ${description}`)
      .join('\n');

    const request: LLMRequest = {
      prompt: `Extract the following data from the HTML:\n${schemaDescription}\n\nHTML:\n${html}\n\nRespond with a JSON object containing the extracted data.`,
      systemPrompt: 'You are a data extraction assistant. Always respond with valid JSON.',
    };

    const response = await this.chat(request);
    
    try {
      return JSON.parse(response.content);
    } catch (error) {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse extracted data as JSON');
    }
  }

  async generateAutomationSteps(description: string): Promise<any[]> {
    const request: LLMRequest = {
      prompt: `Generate browser automation steps for the following task: ${description}\n\nProvide the steps as a JSON array with action type, selector, and value fields.`,
      systemPrompt: 'You are an automation expert. Generate practical browser automation steps as valid JSON.',
    };

    const response = await this.chat(request);
    
    try {
      return JSON.parse(response.content);
    } catch (error) {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse automation steps as JSON');
    }
  }
}

export default LLMBridge;
