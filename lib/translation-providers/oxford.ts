import axios from 'axios';
import { TranslationProvider } from './base';
import { providerLogger } from '../logger';

interface OxfordLexicalEntry {
  entries: {
    senses: {
      definitions?: string[];
      examples?: { text: string }[];
    }[];
  }[];
}

interface OxfordResult {
  lexicalEntries: OxfordLexicalEntry[];
}

interface OxfordResponse {
  results: OxfordResult[];
}

export class OxfordProvider implements TranslationProvider {
  name = 'Oxford Dictionary';
  private appId: string;
  private appKey: string;

  constructor(appId: string, appKey: string) {
    this.appId = appId;
    this.appKey = appKey;
    providerLogger.info('Oxford Dictionary initialized');
  }

  async translate(text: string, source: string, target: string): Promise<{ translatedText: string; alternatives?: string[] }> {
    try {
      // Oxford Dictionary API supports multiple languages but requires language-specific endpoints
      // For now, implementing English only
      if (source !== 'en' && target !== 'en') {
        throw new Error('Oxford Dictionary currently only supports English definitions');
      }

      providerLogger.debug(`Oxford Dictionary looking up: "${text}"`);

      const response = await axios.get<OxfordResponse>(
        `https://od-api.oxforddictionaries.com/api/v2/entries/en-us/${encodeURIComponent(text.toLowerCase())}`,
        {
          headers: {
            'app_id': this.appId,
            'app_key': this.appKey
          },
          timeout: 10000
        }
      );

      if (!response.data || !response.data.results || response.data.results.length === 0) {
        providerLogger.debug(`Oxford Dictionary: No definition found for "${text}"`);
        return { translatedText: '', alternatives: [] };
      }

      const definitions: string[] = [];
      
      for (const result of response.data.results) {
        if (result.lexicalEntries) {
          for (const lexEntry of result.lexicalEntries) {
            if (lexEntry.entries) {
              for (const entry of lexEntry.entries) {
                if (entry.senses) {
                  for (const sense of entry.senses) {
                    if (sense.definitions) {
                      for (const def of sense.definitions) {
                        if (!definitions.includes(def)) {
                          definitions.push(def);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      const translatedText = definitions[0] || '';
      const alternatives = definitions.slice(1, 6); // Up to 5 alternatives

      providerLogger.debug(`Oxford Dictionary result: "${translatedText}" (${alternatives.length} alternatives)`);

      return {
        translatedText,
        alternatives
      };
    } catch (error: any) {
      if (error.response?.status === 403) {
        providerLogger.error('Oxford Dictionary: Authentication failed - check your App ID and App Key');
      } else if (error.response?.status === 404) {
        providerLogger.error('Oxford Dictionary: Word not found');
      } else if (error.response?.status === 414) {
        providerLogger.error('Oxford Dictionary: Request URI too long');
      } else {
        providerLogger.error(`Oxford Dictionary error`, {
          message: error.message,
          status: error.response?.status
        });
      }
      throw error;
    }
  }

  async isConfigured(): Promise<boolean> {
    return !!(this.appId && this.appKey);
  }

  async testConnection(): Promise<boolean> {
    try {
      providerLogger.debug('Testing Oxford Dictionary connection...');

      const response = await axios.get(
        'https://od-api.oxforddictionaries.com/api/v2/entries/en-us/test',
        {
          headers: {
            'app_id': this.appId,
            'app_key': this.appKey
          },
          timeout: 5000
        }
      );

      providerLogger.info('Oxford Dictionary connection test: SUCCESS');
      return true;
    } catch (error: any) {
      providerLogger.error('Oxford Dictionary connection test: FAILED', {
        message: error.message,
        status: error.response?.status
      });
      return false;
    }
  }
}
