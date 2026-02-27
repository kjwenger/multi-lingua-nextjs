import axios from 'axios';
import { TranslationProvider } from './base';
import { providerLogger } from '../logger';

// PONS language code mapping (PONS uses two-letter codes combined, e.g., "deen" for German-English)
// Generate all possible language pair combinations
const PONS_LANG_PAIRS: Record<string, Record<string, string>> = {
  en: { de: 'deen', fr: 'enfr', es: 'enes', it: 'enit', pl: 'enpl', pt: 'enpt', ru: 'enru', zh: 'enzh' },
  de: { en: 'deen', fr: 'defr', es: 'dees', it: 'deit', pl: 'depl', pt: 'dept', ru: 'deru', zh: 'dezh' },
  fr: { en: 'enfr', de: 'defr', es: 'esfr', it: 'frit', pl: 'frpl', pt: 'frpt', ru: 'frru', zh: 'frzh' },
  es: { en: 'enes', de: 'dees', fr: 'esfr', it: 'esit', pl: 'espl', pt: 'espt', ru: 'esru', zh: 'eszh' },
  it: { en: 'enit', de: 'deit', fr: 'frit', es: 'esit', pl: 'itpl', pt: 'itpt', ru: 'itru', zh: 'itzh' },
  pl: { en: 'enpl', de: 'depl', fr: 'frpl', es: 'espl', it: 'itpl', pt: 'plpt', ru: 'plru', zh: 'plzh' },
  pt: { en: 'enpt', de: 'dept', fr: 'frpt', es: 'espt', it: 'itpt', pl: 'plpt', ru: 'ptru', zh: 'ptzh' },
  ru: { en: 'enru', de: 'deru', fr: 'frru', es: 'esru', it: 'itru', pl: 'plru', pt: 'ptru', zh: 'ruzh' },
  zh: { en: 'enzh', de: 'dezh', fr: 'frzh', es: 'eszh', it: 'itzh', pl: 'plzh', pt: 'ptzh', ru: 'ruzh' }
};

interface PonsRom {
  headword: string;
  headword_full: string;
  wordclass?: string;
  arabs: PonsArab[];
}

interface PonsArab {
  header?: string;
  translations: PonsTranslation[];
}

interface PonsTranslation {
  source: string;
  target: string;
}

interface PonsHit {
  type: string;
  opendict: boolean;
  roms: PonsRom[];
}

interface PonsResponse {
  lang: string;
  hits: PonsHit[];
}

export class PonsProvider implements TranslationProvider {
  name = 'PONS';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    providerLogger.info('PONS Dictionary initialized');
  }

  private getLangPair(source: string, target: string): string | null {
    const sourceLangs = PONS_LANG_PAIRS[source];
    if (sourceLangs && sourceLangs[target]) {
      return sourceLangs[target];
    }
    // Try reverse lookup
    const targetLangs = PONS_LANG_PAIRS[target];
    if (targetLangs && targetLangs[source]) {
      return targetLangs[source];
    }
    return null;
  }

  private stripHtml(html: string): string {
    // Remove HTML tags but keep the text content
    return html.replace(/<[^>]*>/g, '').trim();
  }

  async translate(text: string, source: string, target: string): Promise<{ translatedText: string; alternatives?: string[] }> {
    try {
      const langPair = this.getLangPair(source, target);
      if (!langPair) {
        providerLogger.warn(`PONS: No dictionary available for ${source} -> ${target}`);
        throw new Error(`PONS does not support ${source} -> ${target} translation`);
      }

      providerLogger.debug(`PONS looking up: "${text}" (${langPair})`);

      const response = await axios.get<PonsResponse[]>('https://api.pons.com/v1/dictionary', {
        params: {
          q: text,
          l: langPair,
          in: source // Specify source language to get correct direction
        },
        headers: {
          'X-Secret': this.apiKey
        },
        timeout: 10000,
        validateStatus: (status) => status === 200 || status === 204
      });

      // 204 means no results found
      if (response.status === 204 || !response.data || response.data.length === 0) {
        providerLogger.debug(`PONS: No results found for "${text}"`);
        return { translatedText: '', alternatives: [] };
      }

      // Extract translations from the response
      const translations: string[] = [];

      for (const result of response.data) {
        if (result.hits) {
          for (const hit of result.hits) {
            if (hit.roms) {
              for (const rom of hit.roms) {
                if (rom.arabs) {
                  for (const arab of rom.arabs) {
                    if (arab.translations) {
                      for (const trans of arab.translations) {
                        // Extract the target translation, strip HTML
                        const targetText = this.stripHtml(trans.target);
                        if (targetText && !translations.includes(targetText)) {
                          translations.push(targetText);
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

      const translatedText = translations[0] || '';
      const alternatives = translations.slice(1, 11); // Up to 10 alternatives

      providerLogger.debug(`PONS result: "${translatedText}" (${alternatives.length} alternatives)`);

      return {
        translatedText,
        alternatives
      };
    } catch (error: any) {
      if (error.response?.status === 403) {
        providerLogger.error('PONS: Authentication failed - check your API key');
      } else if (error.response?.status === 404) {
        providerLogger.error(`PONS: Dictionary not found for language pair`);
      } else if (error.response?.status === 503) {
        providerLogger.error('PONS: Daily limit reached');
      } else {
        providerLogger.error(`PONS error (${source} -> ${target})`, {
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
      providerLogger.debug('Testing PONS connection...');

      const response = await axios.get('https://api.pons.com/v1/dictionary', {
        params: {
          q: 'test',
          l: 'deen'
        },
        headers: {
          'X-Secret': this.apiKey
        },
        timeout: 5000,
        validateStatus: (status) => status === 200 || status === 204
      });

      providerLogger.info('PONS connection test: SUCCESS');
      return true;
    } catch (error: any) {
      providerLogger.error('PONS connection test: FAILED', {
        message: error.message,
        status: error.response?.status
      });
      return false;
    }
  }
}
