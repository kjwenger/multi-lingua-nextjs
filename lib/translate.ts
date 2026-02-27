import axios from 'axios';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

function isDocker() {
  try {
    return fs.existsSync('/.dockerenv') || (fs.existsSync('/proc/1/cgroup') && fs.readFileSync('/proc/1/cgroup', 'utf8').includes('docker'));
  } catch {
    return false;
  }
}

const dataDir = process.env.DATA_DIR
  ? process.env.DATA_DIR
  : isDocker()
    ? '/app/data'
    : path.join(process.cwd(), 'app', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'translations.db');

// LibreTranslate URL configuration with fallbacks for different environments
const getLibreTranslateUrlFromDb = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      const db = new sqlite3.Database(dbPath);
      
      db.get('SELECT value FROM settings WHERE key = ?', ['libretranslate_url'], (err, row: { value: string } | undefined) => {
        db.close();
        
        if (!err && row?.value && row.value !== 'ENV_DEFAULT') {
          resolve(row.value);
        } else {
          resolve(null);
        }
      });
    } catch (error) {
      resolve(null);
    }
  });
};

const getDefaultLibreTranslateUrl = (): string => {
  if (process.env.LIBRETRANSLATE_URL) {
    return process.env.LIBRETRANSLATE_URL;
  }

  if (process.env.DOCKER_COMPOSE) {
    return 'http://libretranslate:5000';
  }

  if (isDocker()) {
    return 'http://host.docker.internal:5432';
  }

  return 'http://localhost:5432';
};

const DEFAULT_URL = getDefaultLibreTranslateUrl();

// Log the default LibreTranslate URL being used (helpful for debugging)
console.log(`Default LibreTranslate URL: ${DEFAULT_URL}`);

export interface TranslationResult {
  translatedText: string;
  alternatives?: string[];
}

export class LibreTranslateService {
  private async getUrl(): Promise<string> {
    const dbUrl = await getLibreTranslateUrlFromDb();
    return dbUrl || DEFAULT_URL;
  }

  private async translate(text: string, source: string, target: string, requestAlternatives: boolean = false): Promise<{ translatedText: string; alternatives: string[] }> {
    try {
      const payload: any = {
        q: text,
        source: source,
        target: target,
        format: 'text'
      };
      
      // Request alternatives from LibreTranslate
      if (requestAlternatives) {
        payload.alternatives = 10; // Request up to 10 alternatives
      }
      
      // Add api_key if set in environment
      if (process.env.LIBRETRANSLATE_API_KEY) {
        payload.api_key = process.env.LIBRETRANSLATE_API_KEY;
      }
      console.log(`Translating "${text}" from ${source} to ${target}`);
      console.log('Sending payload to LibreTranslate:', JSON.stringify(payload));
      const url = await this.getUrl();
      const response = await axios.post(
        `${url}/translate`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      const result = response.data.translatedText || '';
      const alternatives = response.data.alternatives || [];
      console.log(`Translation result (${source} -> ${target}): "${result}"`);
      if (alternatives.length > 0) {
        console.log(`Alternatives: ${alternatives.join(', ')}`);
      }
      return { translatedText: result, alternatives };
    } catch (error) {
      console.error(`Translation error (${source} -> ${target}):`, error);
      return { translatedText: '', alternatives: [] };
    }
  }



  public async translateFromLanguage(text: string, sourceLanguage: 'en' | 'de' | 'fr' | 'it' | 'es'): Promise<{
    english?: TranslationResult;
    german?: TranslationResult;
    french?: TranslationResult;
    italian?: TranslationResult;
    spanish?: TranslationResult;
  }> {
    const languageNames = { en: 'English', de: 'German', fr: 'French', it: 'Italian', es: 'Spanish' };
    console.log(`\n=== Translation Request ===`);
    console.log(`Source: ${languageNames[sourceLanguage]} (${sourceLanguage})`);
    console.log(`Text: "${text}"`);
    
    const results: any = {};
    const targets = [];
    
    if (sourceLanguage !== 'en') targets.push({ key: 'english', code: 'en' });
    if (sourceLanguage !== 'de') targets.push({ key: 'german', code: 'de' });
    if (sourceLanguage !== 'fr') targets.push({ key: 'french', code: 'fr' });
    if (sourceLanguage !== 'it') targets.push({ key: 'italian', code: 'it' });
    if (sourceLanguage !== 'es') targets.push({ key: 'spanish', code: 'es' });

    console.log(`Target languages: ${targets.map(t => `${t.key} (${t.code})`).join(', ')}`);

    const translations = await Promise.all(
      targets.map(async (target) => {
        const { translatedText, alternatives } = await this.translate(text, sourceLanguage, target.code, true);
        console.log(`✓ Placing into ${target.key}: "${translatedText}"`);
        return { key: target.key, result: { translatedText, alternatives } };
      })
    );

    translations.forEach(({ key, result }) => {
      results[key] = result;
    });

    console.log(`=== Translation Complete ===\n`);
    return results;
  }

  public async translateToGerman(text: string): Promise<TranslationResult> {
    return await this.translate(text, 'en', 'de', true);
  }

  public async translateToFrench(text: string): Promise<TranslationResult> {
    return await this.translate(text, 'en', 'fr', true);
  }

  public async translateToItalian(text: string): Promise<TranslationResult> {
    return await this.translate(text, 'en', 'it', true);
  }

  public async translateToSpanish(text: string): Promise<TranslationResult> {
    return await this.translate(text, 'en', 'es', true);
  }

  public async translateToAllLanguages(text: string): Promise<{
    german: TranslationResult;
    french: TranslationResult;
    italian: TranslationResult;
    spanish: TranslationResult;
  }> {
    const [german, french, italian, spanish] = await Promise.all([
      this.translateToGerman(text),
      this.translateToFrench(text),
      this.translateToItalian(text),
      this.translateToSpanish(text)
    ]);

    return { german, french, italian, spanish };
  }
}

export const translateService = new LibreTranslateService();
