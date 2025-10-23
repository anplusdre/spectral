import axios, { AxiosInstance } from 'axios';
import { OCRRequest, OCRResponse, OCRBlock } from '../types';

export class OCRBridge {
  private apiKey: string;
  private endpoint: string;
  private client: AxiosInstance;

  constructor(apiKey?: string, endpoint?: string) {
    this.apiKey = apiKey || process.env.DEEPSEEK_OCR_API_KEY || '';
    this.endpoint = endpoint || process.env.DEEPSEEK_OCR_API_ENDPOINT || 'https://api.deepseek.com/v1/ocr';

    this.client = axios.create({
      baseURL: this.endpoint,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async extractText(request: OCRRequest): Promise<OCRResponse> {
    try {
      const payload: any = {
        language: request.language || 'en',
      };

      if (request.imageUrl) {
        payload.image_url = request.imageUrl;
      } else if (request.imageBase64) {
        payload.image = request.imageBase64;
      } else {
        throw new Error('Either imageUrl or imageBase64 must be provided');
      }

      const response = await this.client.post('/', payload);

      const blocks: OCRBlock[] = (response.data.blocks || []).map((block: any) => ({
        text: block.text,
        confidence: block.confidence || 0,
        boundingBox: {
          x: block.bounding_box?.x || 0,
          y: block.bounding_box?.y || 0,
          width: block.bounding_box?.width || 0,
          height: block.bounding_box?.height || 0,
        },
      }));

      return {
        text: response.data.text || blocks.map(b => b.text).join(' '),
        confidence: response.data.confidence || 0,
        blocks,
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('OCR API authentication failed. Please check your API key.');
      }
      throw new Error(`OCR API error: ${error.message}`);
    }
  }

  async extractFromScreenshot(screenshotBase64: string, language?: string): Promise<OCRResponse> {
    return this.extractText({
      imageBase64: screenshotBase64,
      language,
    });
  }

  async extractFromUrl(url: string, language?: string): Promise<OCRResponse> {
    return this.extractText({
      imageUrl: url,
      language,
    });
  }

  async extractStructuredData(imageBase64: string, fields: string[]): Promise<Record<string, string>> {
    const ocrResult = await this.extractText({ imageBase64 });
    
    const result: Record<string, string> = {};
    const text = ocrResult.text.toLowerCase();
    
    for (const field of fields) {
      const fieldLower = field.toLowerCase();
      const patterns = [
        new RegExp(`${fieldLower}[:\\s]+([^\\n]+)`, 'i'),
        new RegExp(`${fieldLower}\\s*:?\\s*([^\\n]+)`, 'i'),
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          result[field] = match[1].trim();
          break;
        }
      }
    }
    
    return result;
  }
}

export default OCRBridge;
