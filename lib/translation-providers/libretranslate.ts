import axios from 'axios';
import { TranslationProvider } from './base';

export class LibreTranslateProvider implements TranslationProvider {
  name = 'LibreTranslate';
  private apiUrl: string;
  private apiKey?: string;

  constructor(apiUrl: string, apiKey?: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async translate(text: string, source: string, target: string): Promise<{ translatedText: string; alternatives?: string[] }> {
    try {
      const payload: any = {
        q: text,
        source: source,
        target: target,
        format: 'text',
        alternatives: 10
      };

      if (this.apiKey) {
        payload.api_key = this.apiKey;
      }

      const response = await axios.post(
        `${this.apiUrl}/translate`,
        payload,
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );

      return {
        translatedText: response.data.translatedText || '',
        alternatives: response.data.alternatives || []
      };
    } catch (error) {
      console.error(`LibreTranslate error (${source} -> ${target}):`, error);
      throw error;
    }
  }

  async isConfigured(): Promise<boolean> {
    return !!this.apiUrl;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiUrl}/languages`, { timeout: 5000 });
      return Array.isArray(response.data);
    } catch {
      return false;
    }
  }
}
