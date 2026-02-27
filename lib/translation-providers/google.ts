import axios from 'axios';
import { TranslationProvider } from './base';
import { providerLogger } from '../logger';

export class GoogleProvider implements TranslationProvider {
  name = 'Google Translate';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    providerLogger.info('Google Translate initialized');
  }

  async translate(text: string, source: string, target: string): Promise<{ translatedText: string; alternatives?: string[] }> {
    try {
      providerLogger.debug(`Google translating: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" (${source} -> ${target})`);

      const response = await axios.post(
        'https://translation.googleapis.com/language/translate/v2',
        null,
        {
          params: {
            key: this.apiKey,
            q: text,
            source: source,
            target: target,
            format: 'text'
          },
          timeout: 10000
        }
      );

      const translatedText = response.data.data.translations[0]?.translatedText || '';
      providerLogger.debug(`Google result: "${translatedText.substring(0, 50)}${translatedText.length > 50 ? '...' : ''}"`);

      return {
        translatedText,
        alternatives: []
      };
    } catch (error: any) {
      providerLogger.error(`Google Translate error (${source} -> ${target})`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  async isConfigured(): Promise<boolean> {
    return !!this.apiKey;
  }

  async testConnection(): Promise<boolean> {
    try {
      providerLogger.debug('Testing Google Translate connection...');

      await axios.post(
        'https://translation.googleapis.com/language/translate/v2',
        null,
        {
          params: {
            key: this.apiKey,
            q: 'test',
            target: 'es'
          },
          timeout: 5000
        }
      );

      providerLogger.info('Google Translate connection test: SUCCESS');
      return true;
    } catch (error: any) {
      providerLogger.error('Google Translate connection test: FAILED', {
        message: error.message,
        status: error.response?.status
      });
      return false;
    }
  }
}
