import { TranslationProvider, ProviderConfig } from './base';
import { LibreTranslateProvider } from './libretranslate';
import { MyMemoryProvider } from './mymemory';
import { DeepLProvider } from './deepl';
import { GoogleProvider } from './google';
import { AzureProvider } from './azure';
import { PonsProvider } from './pons';
import { MerriamWebsterProvider } from './merriam-webster';
// import { FreeDictionaryProvider } from './free-dictionary';
import { OxfordProvider } from './oxford';
import { TatoebaProvider } from './tatoeba';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { providerLogger } from '../logger';
import { decode } from 'html-entities';

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

export class TranslationService {
  private provider: TranslationProvider | null = null;

  async initialize() {
    providerLogger.info('Initializing TranslationService...');
    const configs = await this.loadProviderConfigs();
    const activeProviderType = await this.getActiveProvider();
    providerLogger.debug(`Loaded ${configs.length} provider configs, active: ${activeProviderType}`, configs);

    // Find the active provider config
    const activeConfig = configs.find(c => c.type === activeProviderType);
    
    if (activeConfig && activeConfig.enabled) {
      this.provider = this.createProvider(activeConfig);
      if (this.provider) {
        providerLogger.info(`Active provider set to: ${activeConfig.type}`);
        return;
      }
    }

    // Fallback: use first enabled provider
    for (const config of configs) {
      if (!config.enabled) continue;
      
      const provider = this.createProvider(config);
      if (provider) {
        this.provider = provider;
        providerLogger.info(`Fallback to first enabled provider: ${config.type}`);
        return;
      }
    }

    if (!this.provider) {
      providerLogger.warn('No translation provider configured!');
    }
  }

  private createProvider(config: ProviderConfig): TranslationProvider | null {
    let provider: TranslationProvider | null = null;

    switch (config.type) {
      case 'libretranslate':
        if (config.apiUrl) {
          providerLogger.info(`Creating LibreTranslateProvider with URL: ${config.apiUrl}`);
          provider = new LibreTranslateProvider(config.apiUrl, config.apiKey);
        } else {
          providerLogger.debug('LibreTranslate skipped (no apiUrl)');
        }
        break;
      case 'mymemory':
        const myMemoryEmail = config.email || process.env.MYMEMORY_EMAIL;
        providerLogger.info(`Creating MyMemoryProvider with email: ${myMemoryEmail || '(none)'}`);
        provider = new MyMemoryProvider(myMemoryEmail);
        break;
      case 'deepl':
        if (config.apiKey) {
          providerLogger.info('Creating DeepLProvider');
          provider = new DeepLProvider(config.apiKey, true);
        } else {
          providerLogger.debug('DeepL skipped (no apiKey)');
        }
        break;
      case 'google':
        if (config.apiKey) {
          providerLogger.info('Creating GoogleProvider');
          provider = new GoogleProvider(config.apiKey);
        } else {
          providerLogger.debug('Google skipped (no apiKey)');
        }
        break;
      case 'azure':
        if (config.apiKey) {
          providerLogger.info('Creating AzureProvider');
          provider = new AzureProvider(config.apiKey, config.region);
        } else {
          providerLogger.debug('Azure skipped (no apiKey)');
        }
        break;
      case 'pons':
        if (config.apiKey) {
          providerLogger.info('Creating PonsProvider');
          provider = new PonsProvider(config.apiKey);
        } else {
          providerLogger.debug('PONS skipped (no apiKey)');
        }
        break;
      case 'merriam-webster':
        if (config.apiKey) {
          providerLogger.info('Creating MerriamWebsterProvider');
          provider = new MerriamWebsterProvider(config.apiKey);
        } else {
          providerLogger.debug('Merriam-Webster skipped (no apiKey)');
        }
        break;
      // case 'free-dictionary':
      //   providerLogger.info('Creating FreeDictionaryProvider (no API key required)');
      //   provider = new FreeDictionaryProvider();
      //   break;
      case 'oxford':
        if (config.apiKey && config.appId) {
          providerLogger.info('Creating OxfordProvider');
          provider = new OxfordProvider(config.appId, config.apiKey);
        } else {
          providerLogger.debug('Oxford skipped (no apiKey or appId)');
        }
        break;
      case 'tatoeba':
        providerLogger.info('Creating TatoebaProvider (no API key required)');
        provider = new TatoebaProvider();
        break;
    }

    return provider;
  }

  private async getActiveProvider(): Promise<string> {
    return new Promise((resolve) => {
      const db = new sqlite3.Database(dbPath);
      
      db.get('SELECT value FROM settings WHERE key = ?', ['active_provider'], (err, row: any) => {
        db.close();
        if (err || !row) {
          resolve('libretranslate'); // default
        } else {
          resolve(row.value);
        }
      });
    });
  }

  private async loadProviderConfigs(): Promise<ProviderConfig[]> {
    providerLogger.debug('Loading provider configs from database');
    return new Promise((resolve) => {
      const db = new sqlite3.Database(dbPath);

      db.run(`
        CREATE TABLE IF NOT EXISTS provider_configs (
          type TEXT PRIMARY KEY,
          enabled INTEGER DEFAULT 1,
          api_key TEXT,
          api_url TEXT,
          region TEXT,
          email TEXT,
          app_id TEXT
        )
      `, (err) => {
        if (err) providerLogger.error('Error creating provider_configs table', err);
      });

      // Add email column if it doesn't exist (for existing databases)
      db.run(`ALTER TABLE provider_configs ADD COLUMN email TEXT`, () => {});
      // Add app_id column if it doesn't exist (for Oxford)
      db.run(`ALTER TABLE provider_configs ADD COLUMN app_id TEXT`, () => {});

      db.all('SELECT * FROM provider_configs', (err, rows: any[]) => {
        if (err || !rows || rows.length === 0) {
          const defaultUrl = this.getDefaultLibreTranslateUrl();
          providerLogger.info(`No configs found, creating default LibreTranslate with URL: ${defaultUrl}`);
          const defaultConfigs: ProviderConfig[] = [
            { type: 'libretranslate', enabled: true, apiUrl: defaultUrl },
            { type: 'mymemory', enabled: false }
          ];

          // Insert default LibreTranslate config into database
          db.run(`
            INSERT OR REPLACE INTO provider_configs (type, enabled, api_url)
            VALUES (?, ?, ?)
          `, ['libretranslate', 1, defaultUrl], (insertErr) => {
            if (insertErr) providerLogger.error('Error inserting default config', insertErr);
            db.close();
            resolve(defaultConfigs);
          });
        } else {
          const configs = rows.map(row => ({
            type: row.type as any,
            enabled: row.enabled === 1,
            apiKey: row.api_key,
            apiUrl: row.api_url,
            region: row.region,
            email: row.email,
            appId: row.app_id
          }));

          // Fix any libretranslate entries with null URL
          const libreConfig = configs.find(c => c.type === 'libretranslate');
          if (libreConfig && !libreConfig.apiUrl) {
            const defaultUrl = this.getDefaultLibreTranslateUrl();
            providerLogger.debug(`LibreTranslate has null URL, updating to: ${defaultUrl}`);
            libreConfig.apiUrl = defaultUrl;
            db.run(`UPDATE provider_configs SET api_url = ? WHERE type = ?`, [defaultUrl, 'libretranslate']);
          }

          providerLogger.debug('Loaded configs from DB', configs);
          db.close();
          resolve(configs);
        }
      });
    });
  }

  private getDefaultLibreTranslateUrl(): string {
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
  }

  getActiveProviderName(): string {
    return this.provider?.name || 'NONE';
  }

  private async translateWithProvider(provider: TranslationProvider, text: string, source: string, target: string): Promise<{ translatedText: string; alternatives: string[] }> {
    try {
      const result = await provider.translate(text, source, target);
      return { translatedText: result.translatedText, alternatives: result.alternatives || [] };
    } catch (error) {
      throw error;
    }
  }

  async translate(text: string, source: string, target: string): Promise<{ translatedText: string; alternatives: string[] }> {
    if (!this.provider) {
      providerLogger.error('No translation provider configured');
      throw new Error('No translation provider configured');
    }

    providerLogger.debug(`Translating with ${this.provider.name}: "${text}" (${source} -> ${target})`);
    const result = await this.translateWithProvider(this.provider, text, source, target);

    // Decode HTML entities from provider responses (e.g., &lt; -> <)
    const decoded = {
      translatedText: decode(result.translatedText),
      alternatives: (result.alternatives || []).map(alt => decode(alt))
    };

    providerLogger.debug(`Result: "${decoded.translatedText}"`);
    return decoded;
  }

  async translateFromLanguage(text: string, sourceLanguage: 'en' | 'de' | 'fr' | 'it' | 'es'): Promise<{
    english?: { translatedText: string; alternatives?: string[] };
    german?: { translatedText: string; alternatives?: string[] };
    french?: { translatedText: string; alternatives?: string[] };
    italian?: { translatedText: string; alternatives?: string[] };
    spanish?: { translatedText: string; alternatives?: string[] };
  }> {
    const results: any = {};
    const targets = [];
    
    if (sourceLanguage !== 'en') targets.push({ key: 'english', code: 'en' });
    if (sourceLanguage !== 'de') targets.push({ key: 'german', code: 'de' });
    if (sourceLanguage !== 'fr') targets.push({ key: 'french', code: 'fr' });
    if (sourceLanguage !== 'it') targets.push({ key: 'italian', code: 'it' });
    if (sourceLanguage !== 'es') targets.push({ key: 'spanish', code: 'es' });

    const translations = await Promise.all(
      targets.map(async (target) => {
        const result = await this.translate(text, sourceLanguage, target.code);
        return { key: target.key, result };
      })
    );

    translations.forEach(({ key, result }) => {
      results[key] = result;
    });

    // Source-language proposals (e.g. Tatoeba example sentences).
    // Wrapped in try/catch so providers that reject same-language translation don't break anything.
    try {
      const sourceResult = await this.translate(text, sourceLanguage, sourceLanguage);
      if (sourceResult.alternatives && sourceResult.alternatives.length > 0) {
        const langKeyMap: Record<string, string> = { en: 'english', de: 'german', fr: 'french', it: 'italian', es: 'spanish' };
        // Keep the original text — only add the alternatives
        results[langKeyMap[sourceLanguage]] = {
          translatedText: text,
          alternatives: sourceResult.alternatives,
        };
      }
    } catch {
      // Provider doesn't support same-language — skip silently
    }

    return results;
  }
}

let translationServiceInstance: TranslationService | null = null;

export async function getTranslationService(): Promise<TranslationService> {
  if (!translationServiceInstance) {
    translationServiceInstance = new TranslationService();
  }
  // Always reinitialize to ensure we have the latest active provider
  await translationServiceInstance.initialize();
  return translationServiceInstance;
}

export function resetTranslationService(): void {
  providerLogger.info('Resetting cached instance - will reinitialize on next request');
  translationServiceInstance = null;
}
