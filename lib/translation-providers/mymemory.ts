import axios from 'axios';
import { TranslationProvider } from './base';

interface MyMemoryMatch {
  segment: string;
  translation: string;
  match: number; // confidence score 0-1
  quality: number;
  source: string;
}

interface MyMemoryResponse {
  responseData: {
    translatedText: string;
    match: number;
  };
  matches?: MyMemoryMatch[];
}

export class MyMemoryProvider implements TranslationProvider {
  name = 'MyMemory';
  private email?: string;

  constructor(email?: string) {
    this.email = email;
  }

  async translate(text: string, source: string, target: string): Promise<{ translatedText: string; alternatives?: string[] }> {
    try {
      const params: Record<string, string> = {
        q: text,
        langpair: `${source}|${target}`
      };

      // Adding email increases quota from 10K to 30K words/day
      if (this.email) {
        params.de = this.email;
      }

      const response = await axios.get<MyMemoryResponse>('https://api.mymemory.translated.net/get', {
        params,
        timeout: 10000
      });

      const translatedText = response.data.responseData.translatedText || '';

      // Extract alternatives from matches, sorted by confidence score (descending)
      const alternatives: string[] = [];
      if (response.data.matches && response.data.matches.length > 0) {
        const sortedMatches = [...response.data.matches]
          .sort((a, b) => b.match - a.match) // Sort by confidence descending
          .filter(m => m.translation && m.translation !== translatedText); // Exclude duplicates of main translation

        for (const match of sortedMatches) {
          if (match.translation && !alternatives.includes(match.translation)) {
            alternatives.push(match.translation);
          }
          if (alternatives.length >= 10) break; // Limit to 10 alternatives
        }
      }

      return {
        translatedText,
        alternatives
      };
    } catch (error) {
      console.error(`MyMemory error (${source} -> ${target}):`, error);
      throw error;
    }
  }

  async isConfigured(): Promise<boolean> {
    return true;
  }

  async testConnection(): Promise<boolean> {
    try {
      const params: Record<string, string> = { q: 'test', langpair: 'en|es' };
      if (this.email) {
        params.de = this.email;
      }

      const response = await axios.get('https://api.mymemory.translated.net/get', {
        params,
        timeout: 5000
      });
      return !!response.data.responseData;
    } catch {
      return false;
    }
  }
}
