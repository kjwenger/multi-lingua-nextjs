import axios from 'axios';
import { TranslationProvider } from './base';

// Request timeout in ms. Slow hosts (e.g. a Raspberry Pi) need more than a few seconds,
// especially when several translations queue up on the same LibreTranslate instance.
const DEFAULT_TIMEOUT_MS = 60000;
function getTimeoutMs(): number {
  const parsed = parseInt(process.env.LIBRETRANSLATE_TIMEOUT_MS || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

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
        { headers: { 'Content-Type': 'application/json' }, timeout: getTimeoutMs() }
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
