import axios from 'axios';
import { TranslationProvider } from './base';
import { providerLogger } from '../logger';

interface FreeDictionaryMeaning {
  partOfSpeech: string;
  definitions: {
    definition: string;
    example?: string;
    synonyms?: string[];
  }[];
}

interface FreeDictionaryEntry {
  word: string;
  phonetic?: string;
  meanings: FreeDictionaryMeaning[];
}

export class FreeDictionaryProvider implements TranslationProvider {
  name = 'Free Dictionary';

  constructor() {
    providerLogger.info('Free Dictionary API initialized');
  }

  async translate(text: string, source: string, target: string): Promise<{ translatedText: string; alternatives?: string[] }> {
    try {
      // Free Dictionary API only supports English definitions
      if (source !== 'en' && target !== 'en') {
        throw new Error('Free Dictionary API only supports English definitions');
      }

      providerLogger.debug(`Free Dictionary looking up: "${text}"`);

      const response = await axios.get<FreeDictionaryEntry[]>(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(text)}`,
        {
          timeout: 10000
        }
      );

      if (!response.data || response.data.length === 0) {
        providerLogger.debug(`Free Dictionary: No definition found for "${text}"`);
        return { translatedText: '', alternatives: [] };
      }

      const definitions: string[] = [];
      
      for (const entry of response.data) {
        if (entry.meanings) {
          for (const meaning of entry.meanings) {
            if (meaning.definitions) {
              for (const def of meaning.definitions) {
                const defText = `(${meaning.partOfSpeech}) ${def.definition}`;
                if (!definitions.includes(defText)) {
                  definitions.push(defText);
                }
              }
            }
          }
        }
      }

      const translatedText = definitions[0] || '';
      const alternatives = definitions.slice(1, 6); // Up to 5 alternatives

      providerLogger.debug(`Free Dictionary result: "${translatedText}" (${alternatives.length} alternatives)`);

      return {
        translatedText,
        alternatives
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        providerLogger.error('Free Dictionary: Word not found');
      } else {
        providerLogger.error(`Free Dictionary error`, {
          message: error.message,
          status: error.response?.status
        });
      }
      throw error;
    }
  }

  async isConfigured(): Promise<boolean> {
    return true; // No API key needed
  }

  async testConnection(): Promise<boolean> {
    try {
      providerLogger.debug('Testing Free Dictionary connection...');

      const response = await axios.get(
        'https://api.dictionaryapi.dev/api/v2/entries/en/test',
        {
          timeout: 5000
        }
      );

      providerLogger.info('Free Dictionary connection test: SUCCESS');
      return true;
    } catch (error: any) {
      providerLogger.error('Free Dictionary connection test: FAILED', {
        message: error.message,
        status: error.response?.status
      });
      return false;
    }
  }
}
