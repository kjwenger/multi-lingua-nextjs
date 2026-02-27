import axios from 'axios';
import { TranslationProvider } from './base';
import { providerLogger } from '../logger';

interface MerriamWebsterEntry {
  meta: {
    id: string;
    stems: string[];
  };
  hwi: {
    hw: string;
  };
  shortdef: string[];
  fl?: string;
}

export class MerriamWebsterProvider implements TranslationProvider {
  name = 'Merriam-Webster';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    providerLogger.info('Merriam-Webster Dictionary initialized');
  }

  async translate(text: string, source: string, target: string): Promise<{ translatedText: string; alternatives?: string[] }> {
    try {
      // Merriam-Webster only supports English definitions
      if (source !== 'en' && target !== 'en') {
        throw new Error('Merriam-Webster only supports English definitions');
      }

      providerLogger.debug(`Merriam-Webster looking up: "${text}"`);

      const response = await axios.get<MerriamWebsterEntry[]>(
        `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(text)}`,
        {
          params: {
            key: this.apiKey
          },
          timeout: 10000
        }
      );

      if (!response.data || response.data.length === 0 || typeof response.data[0] === 'string') {
        providerLogger.debug(`Merriam-Webster: No definition found for "${text}"`);
        return { translatedText: '', alternatives: [] };
      }

      const definitions: string[] = [];
      
      for (const entry of response.data) {
        if (entry.shortdef) {
          for (const def of entry.shortdef) {
            if (!definitions.includes(def)) {
              definitions.push(def);
            }
          }
        }
      }

      const translatedText = definitions[0] || '';
      const alternatives = definitions.slice(1, 6); // Up to 5 alternatives

      providerLogger.debug(`Merriam-Webster result: "${translatedText}" (${alternatives.length} alternatives)`);

      return {
        translatedText,
        alternatives
      };
    } catch (error: any) {
      if (error.response?.status === 403) {
        providerLogger.error('Merriam-Webster: Authentication failed - check your API key');
      } else if (error.response?.status === 404) {
        providerLogger.error('Merriam-Webster: Word not found');
      } else {
        providerLogger.error(`Merriam-Webster error`, {
          message: error.message,
          status: error.response?.status
        });
      }
      throw error;
    }
  }

  async isConfigured(): Promise<boolean> {
    return !!this.apiKey;
  }

  async testConnection(): Promise<boolean> {
    try {
      providerLogger.debug('Testing Merriam-Webster connection...');

      const response = await axios.get(
        'https://www.dictionaryapi.com/api/v3/references/collegiate/json/test',
        {
          params: {
            key: this.apiKey
          },
          timeout: 5000
        }
      );

      providerLogger.info('Merriam-Webster connection test: SUCCESS');
      return true;
    } catch (error: any) {
      providerLogger.error('Merriam-Webster connection test: FAILED', {
        message: error.message,
        status: error.response?.status
      });
      return false;
    }
  }
}
