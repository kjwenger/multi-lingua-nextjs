import axios from 'axios';
import { TranslationProvider } from './base';
import { providerLogger } from '../logger';

export class DeepLProvider implements TranslationProvider {
  name = 'DeepL';
  private apiKey: string;
  private isFree: boolean;

  constructor(apiKey: string, isFree: boolean = true) {
    this.apiKey = apiKey;
    this.isFree = isFree;
    providerLogger.info(`DeepL initialized (${isFree ? 'Free' : 'Pro'} API)`);
  }

  async translate(text: string, source: string, target: string): Promise<{ translatedText: string; alternatives?: string[] }> {
    try {
      const baseUrl = this.isFree ? 'https://api-free.deepl.com' : 'https://api.deepl.com';
      
      // DeepL language code mapping
      let targetLang = target.toUpperCase();
      let sourceLang = source.toUpperCase();
      
      // DeepL requires EN-US or EN-GB for target English, but accepts EN for source
      if (targetLang === 'EN') {
        targetLang = 'EN-US';
      }

      providerLogger.debug(`DeepL translating: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" (${sourceLang} -> ${targetLang})`);

      const response = await axios.post(
        `${baseUrl}/v2/translate`,
        new URLSearchParams({
          text: text,
          source_lang: sourceLang,
          target_lang: targetLang
        }),
        {
          headers: {
            'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000
        }
      );

      const translatedText = response.data.translations[0]?.text || '';
      providerLogger.debug(`DeepL result: "${translatedText.substring(0, 50)}${translatedText.length > 50 ? '...' : ''}"`);

      return {
        translatedText,
        alternatives: []
      };
    } catch (error: any) {
      providerLogger.error(`DeepL error (${source} -> ${target})`, {
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
      const baseUrl = this.isFree ? 'https://api-free.deepl.com' : 'https://api.deepl.com';
      providerLogger.debug('Testing DeepL connection...');
      
      await axios.post(
        `${baseUrl}/v2/translate`,
        new URLSearchParams({
          text: 'test',
          target_lang: 'ES'
        }),
        {
          headers: {
            'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 5000
        }
      );
      
      providerLogger.info('DeepL connection test: SUCCESS');
      return true;
    } catch (error: any) {
      providerLogger.error('DeepL connection test: FAILED', {
        message: error.message,
        status: error.response?.status
      });
      return false;
    }
  }
}
