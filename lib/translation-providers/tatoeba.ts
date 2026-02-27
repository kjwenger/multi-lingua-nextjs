import axios from 'axios';
import { TranslationProvider } from './base';
import { providerLogger } from '../logger';

const TATOEBA_API = 'https://api.tatoeba.org/unstable';

// ISO 639-1 (MultiLingua) → ISO 639-3 (Tatoeba)
const LANG_MAP: Record<string, string> = {
  en: 'eng',
  de: 'deu',
  fr: 'fra',
  it: 'ita',
  es: 'spa',
};

interface TatoebaSentence {
  id: number;
  text: string;
  lang: string;
  translations: TatoebaTranslation[];
}

interface TatoebaTranslation {
  id: number;
  text: string;
  lang: string;
}

interface TatoebaSearchResponse {
  data: TatoebaSentence[];
  paging: { total: number; has_next: boolean };
}

export class TatoebaProvider implements TranslationProvider {
  name = 'Tatoeba';

  // Promise-based cache so parallel translate() calls share one API request
  private exampleCache = new Map<string, Promise<TatoebaSentence[]>>();

  constructor() {
    providerLogger.info('Tatoeba provider initialized (no API key required)');
  }

  async translate(text: string, source: string, target: string): Promise<{ translatedText: string; alternatives?: string[] }> {
    const srcLang = LANG_MAP[source];
    const tgtLang = LANG_MAP[target];

    if (!srcLang || !tgtLang) {
      throw new Error(`Tatoeba does not support ${source} -> ${target}`);
    }

    providerLogger.debug(`Tatoeba: "${text}" (${source} -> ${target})`);

    // Same-language: return the original text with source-language example sentences
    if (source === target) {
      const sentences = await this.getCachedExamples(text, srcLang);
      const examples = sentences.map(s => s.text);
      return { translatedText: text, alternatives: examples };
    }

    // 1. Primary translation: find the shortest sentence containing the text
    const primary = await this.searchShort(text, srcLang, tgtLang);

    // 2. Proposals: extract target translations from the shared example cache
    const sentences = await this.getCachedExamples(text, srcLang);
    const proposals: string[] = [];
    for (const sentence of sentences) {
      const translation = this.findTranslation(sentence, tgtLang);
      if (translation) {
        proposals.push(translation);
      }
    }

    const translatedText = primary || '';
    const alternatives = proposals.filter(p => p !== translatedText);

    providerLogger.debug(`Tatoeba result: "${translatedText}" (${alternatives.length} alternatives)`);

    return { translatedText, alternatives };
  }

  /**
   * Fetch example sentences once and share across all language pairs.
   * Requires translations in ALL target languages so every returned sentence
   * has correlated translations — proposal[N] in each column comes from
   * the same Tatoeba sentence.
   */
  private getCachedExamples(text: string, srcLang: string): Promise<TatoebaSentence[]> {
    const key = `${srcLang}:${text}`;

    if (!this.exampleCache.has(key)) {
      this.exampleCache.set(key, this.fetchExamples(text, srcLang));
    }

    return this.exampleCache.get(key)!;
  }

  private async fetchExamples(text: string, srcLang: string): Promise<TatoebaSentence[]> {
    try {
      const allTargets = Object.values(LANG_MAP).filter(l => l !== srcLang);

      const params: Record<string, string> = {
        lang: srcLang,
        q: text,
        word_count: '-10',
        sort: 'relevance',
        limit: '10',
      };

      // Require translations in ALL target languages for correlated results
      allTargets.forEach((lang, i) => {
        params[`trans:${i + 1}:lang`] = lang;
      });

      providerLogger.debug(`Tatoeba fetching examples for "${text}" (${srcLang}) requiring ${allTargets.join(', ')}`);

      const response = await axios.get<TatoebaSearchResponse>(`${TATOEBA_API}/sentences`, {
        params,
        timeout: 10000,
      });

      return response.data?.data || [];
    } catch (error: any) {
      providerLogger.debug(`Tatoeba examples fetch failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Search for short sentences (up to 3 words) containing the text,
   * sorted by word count (shortest first). Extract the target-language
   * translation from the shortest match.
   */
  private async searchShort(text: string, srcLang: string, tgtLang: string): Promise<string> {
    try {
      const params: Record<string, string> = {
        lang: srcLang,
        q: text,
        word_count: '-3',
        sort: 'words',
        limit: '5',
      };
      params[`trans:1:lang`] = tgtLang;

      const response = await axios.get<TatoebaSearchResponse>(`${TATOEBA_API}/sentences`, {
        params,
        timeout: 10000,
      });

      const results = response.data?.data || [];

      for (const sentence of results) {
        const translation = this.findTranslation(sentence, tgtLang);
        if (translation) {
          return translation;
        }
      }

      return '';
    } catch (error: any) {
      providerLogger.debug(`Tatoeba short search failed: ${error.message}`);
      return '';
    }
  }

  /**
   * Extract the first translation in the target language from a Tatoeba sentence.
   * Tatoeba returns translations as a flat array of objects.
   */
  private findTranslation(sentence: TatoebaSentence, targetLang: string): string | null {
    if (!sentence.translations) return null;

    for (const trans of sentence.translations) {
      if (trans.lang === targetLang && trans.text) {
        return trans.text;
      }
    }

    return null;
  }

  async isConfigured(): Promise<boolean> {
    return true; // No API key needed
  }

  async testConnection(): Promise<boolean> {
    try {
      providerLogger.debug('Testing Tatoeba connection...');

      const response = await axios.get(`${TATOEBA_API}/sentences`, {
        params: { lang: 'eng', q: 'hello', sort: 'relevance', limit: '1' },
        timeout: 5000,
      });

      providerLogger.info('Tatoeba connection test: SUCCESS');
      return response.status === 200;
    } catch (error: any) {
      providerLogger.error('Tatoeba connection test: FAILED', {
        message: error.message,
        status: error.response?.status,
      });
      return false;
    }
  }
}
