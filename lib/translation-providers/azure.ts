import axios from 'axios';
import { TranslationProvider } from './base';

export class AzureProvider implements TranslationProvider {
  name = 'Azure Translator';
  private apiKey: string;
  private region: string;

  constructor(apiKey: string, region: string = 'global') {
    this.apiKey = apiKey;
    this.region = region;
  }

  async translate(text: string, source: string, target: string): Promise<{ translatedText: string; alternatives?: string[] }> {
    try {
      const response = await axios.post(
        'https://api.cognitive.microsofttranslator.com/translate',
        [{ text }],
        {
          params: {
            'api-version': '3.0',
            from: source,
            to: target
          },
          headers: {
            'Ocp-Apim-Subscription-Key': this.apiKey,
            'Ocp-Apim-Subscription-Region': this.region,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      return {
        translatedText: response.data[0]?.translations[0]?.text || '',
        alternatives: []
      };
    } catch (error) {
      console.error(`Azure Translator error (${source} -> ${target}):`, error);
      throw error;
    }
  }

  async isConfigured(): Promise<boolean> {
    return !!this.apiKey;
  }

  async testConnection(): Promise<boolean> {
    try {
      await axios.post(
        'https://api.cognitive.microsofttranslator.com/translate',
        [{ text: 'test' }],
        {
          params: {
            'api-version': '3.0',
            to: 'es'
          },
          headers: {
            'Ocp-Apim-Subscription-Key': this.apiKey,
            'Ocp-Apim-Subscription-Region': this.region,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );
      return true;
    } catch {
      return false;
    }
  }
}
