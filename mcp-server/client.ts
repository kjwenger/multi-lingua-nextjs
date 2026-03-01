import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as zlib from 'zlib';

// ── Types (mirror the app's data models) ─────────────────────────────────────

export interface Translation {
  id: number;
  user_id: number | null;
  english: string;
  german: string;
  french: string;
  italian: string;
  spanish: string;
  english_proposals: string;
  german_proposals: string;
  french_proposals: string;
  italian_proposals: string;
  spanish_proposals: string;
  created_at: string;
  updated_at: string;
  category_id: number | null;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
  translation_count: number;
}

export interface TranslateResult {
  provider: string;
  english?: { translation: string; alternatives: string[] };
  german?: { translation: string; alternatives: string[] };
  french?: { translation: string; alternatives: string[] };
  italian?: { translation: string; alternatives: string[] };
  spanish?: { translation: string; alternatives: string[] };
}

export interface Provider {
  type: string;
  enabled: number; // 0 or 1
  api_key: string | null;
  api_url: string | null;
  region: string | null;
  email: string | null;
  app_id: string | null;
}

export interface ExportProposals {
  english: string[];
  german: string[];
  french: string[];
  italian: string[];
  spanish: string[];
}

export interface ExportRecord {
  english: string;
  german: string;
  french: string;
  italian: string;
  spanish: string;
  proposals: ExportProposals;
  category: string | null;
}

export interface ExportDoc {
  format: string;
  version: number;
  exported_at: string;
  records: ExportRecord[];
}

export type AnalyzeStatus = 'create' | 'skip' | 'auto_update' | 'conflict';

export interface AnalyzeResult {
  status: AnalyzeStatus;
  incoming: ExportRecord;
  existing?: {
    id: number;
    english: string;
    german: string;
    french: string;
    italian: string;
    spanish: string;
    proposals: ExportProposals;
    category: string | null;
  };
  conflictType?: { proposalsOnly: boolean };
}

export interface AnalyzeResponse {
  total: number;
  creates: number;
  skips: number;
  autoUpdates: number;
  conflicts: number;
  results: AnalyzeResult[];
}

export type DecisionType = 'create' | 'auto_update' | 'ignore' | 'replace' | 'add_as_new';

export interface ExecuteDecision {
  incoming: ExportRecord;
  existingId?: number;
  decision: DecisionType;
}

export interface ExecuteResponse {
  created: number;
  replaced: number;
  addedAsNew: number;
  autoUpdated: number;
  ignored: number;
  errors: string[];
}

// ── Config ────────────────────────────────────────────────────────────────────

interface TokenConfig {
  token: string;
  baseUrl: string;
}

// ── Client ────────────────────────────────────────────────────────────────────

export class MultiLinguaClient {
  private baseUrl: string;
  private token: string;
  private configFile: string;

  constructor() {
    this.configFile = process.env.MCP_CONFIG_FILE
      || path.join(os.homedir(), '.multi-lingua-mcp.json');

    const config = this.loadConfig();
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.token = config.token;
  }

  private loadConfig(): TokenConfig {
    const envUrl = process.env.MULTI_LINGUA_URL;
    const envToken = process.env.MULTI_LINGUA_TOKEN;

    if (envUrl && envToken) {
      return { baseUrl: envUrl, token: envToken };
    }

    if (fs.existsSync(this.configFile)) {
      try {
        const raw = fs.readFileSync(this.configFile, 'utf-8');
        const stored = JSON.parse(raw) as Partial<TokenConfig>;
        return {
          baseUrl: envUrl || stored.baseUrl || 'http://localhost:3456',
          token: envToken || stored.token || '',
        };
      } catch {
        // fall through to defaults
      }
    }

    return {
      baseUrl: envUrl || 'http://localhost:3456',
      token: envToken || '',
    };
  }

  private authHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      // Also send as cookie for cookie-based auth
      headers['Cookie'] = `auth_token=${this.token}`;
    }
    return headers;
  }

  private async request<T>(
    method: string,
    urlPath: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${urlPath}`;
    const res = await fetch(url, {
      method,
      headers: this.authHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      throw new Error(
        'Authentication failed. Set MULTI_LINGUA_TOKEN env var or update ~/.multi-lingua-mcp.json with a valid JWT token.',
      );
    }

    if (!res.ok) {
      let errMsg = `HTTP ${res.status}`;
      try {
        const errBody = await res.json() as { error?: string };
        if (errBody.error) errMsg = errBody.error;
      } catch { /* ignore */ }
      throw new Error(errMsg);
    }

    return res.json() as Promise<T>;
  }

  // ── Translations ────────────────────────────────────────────────────────────

  async listTranslations(category?: string): Promise<Translation[]> {
    const qs = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request<Translation[]>('GET', `/api/translations${qs}`);
  }

  async getTranslationById(id: number): Promise<Translation | null> {
    const all = await this.listTranslations();
    return all.find(t => t.id === id) ?? null;
  }

  async getTranslationByEnglish(english: string): Promise<Translation | null> {
    const all = await this.listTranslations();
    const lower = english.trim().toLowerCase();
    return all.find(t => t.english.trim().toLowerCase() === lower) ?? null;
  }

  async createTranslation(data: {
    english: string;
    german?: string;
    french?: string;
    italian?: string;
    spanish?: string;
    english_proposals?: string;
    german_proposals?: string;
    french_proposals?: string;
    italian_proposals?: string;
    spanish_proposals?: string;
    category_id?: number | null;
  }): Promise<{ id: number; success: boolean }> {
    return this.request('POST', '/api/translations', data);
  }

  async updateTranslation(id: number, data: Record<string, unknown>): Promise<{ success: boolean }> {
    return this.request('PUT', '/api/translations', { id, ...data });
  }

  async deleteTranslation(id: number): Promise<{ success: boolean }> {
    return this.request('DELETE', `/api/translations?id=${id}`);
  }

  // ── Translate (provider call, no persistence) ───────────────────────────────

  async translateText(text: string, sourceLanguage = 'en'): Promise<TranslateResult> {
    return this.request('POST', '/api/translate', { text, sourceLanguage });
  }

  // ── Categories ──────────────────────────────────────────────────────────────

  async listCategories(): Promise<Category[]> {
    return this.request<Category[]>('GET', '/api/categories');
  }

  async createCategory(name: string): Promise<{ id: number }> {
    return this.request('POST', '/api/categories', { name });
  }

  async deleteCategory(id: number): Promise<{ success: boolean }> {
    return this.request('DELETE', `/api/categories?id=${id}`);
  }

  // ── Category resolution helper ──────────────────────────────────────────────

  /** Resolve a category name to its ID, creating it if it does not exist. */
  async resolveCategoryId(name: string): Promise<number> {
    const cats = await this.listCategories();
    const found = cats.find(c => c.name === name);
    if (found) return found.id;
    const { id } = await this.createCategory(name);
    return id;
  }

  // ── Providers ───────────────────────────────────────────────────────────────

  async listProviders(): Promise<Provider[]> {
    const res = await this.request<{ providers: Provider[] }>('GET', '/api/providers');
    return res.providers;
  }

  async saveProvider(data: {
    type: string;
    enabled: boolean;
    apiKey?: string;
    apiUrl?: string;
    region?: string;
    email?: string;
    appId?: string;
  }): Promise<{ success: boolean }> {
    return this.request('POST', '/api/providers', data);
  }

  // ── Export ──────────────────────────────────────────────────────────────────

  async exportTranslations(category?: string): Promise<ExportDoc> {
    const qs = category ? `?category=${encodeURIComponent(category)}` : '';
    const url = `${this.baseUrl}/api/export${qs}`;
    const res = await fetch(url, { headers: this.authHeaders() });

    if (res.status === 401) {
      throw new Error(
        'Authentication failed. Set MULTI_LINGUA_TOKEN env var or update ~/.multi-lingua-mcp.json.',
      );
    }
    if (!res.ok) {
      throw new Error(`Export failed: HTTP ${res.status}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const decompressed = zlib.gunzipSync(buffer);
    return JSON.parse(decompressed.toString('utf-8')) as ExportDoc;
  }

  // ── Import ──────────────────────────────────────────────────────────────────

  async importAnalyze(records: ExportRecord[]): Promise<AnalyzeResponse> {
    const doc: ExportDoc = {
      format: 'multi-lingua-export',
      version: 1,
      exported_at: new Date().toISOString(),
      records,
    };

    const compressed = zlib.gzipSync(Buffer.from(JSON.stringify(doc), 'utf-8'));

    // Build multipart form data with the gzip blob
    const { FormData, Blob } = await import('node:buffer')
      .then(() => ({ FormData: globalThis.FormData, Blob: globalThis.Blob }));

    const formData = new FormData();
    formData.append('file', new Blob([compressed], { type: 'application/gzip' }), 'import.ml.json.gz');

    const res = await fetch(`${this.baseUrl}/api/import?action=analyze`, {
      method: 'POST',
      headers: {
        ...(this.token ? {
          'Authorization': `Bearer ${this.token}`,
          'Cookie': `auth_token=${this.token}`,
        } : {}),
      },
      body: formData,
    });

    if (res.status === 401) {
      throw new Error('Authentication failed for import analyze.');
    }
    if (!res.ok) {
      let errMsg = `HTTP ${res.status}`;
      try {
        const errBody = await res.json() as { error?: string };
        if (errBody.error) errMsg = errBody.error;
      } catch { /* ignore */ }
      throw new Error(errMsg);
    }

    return res.json() as Promise<AnalyzeResponse>;
  }

  async importExecute(decisions: ExecuteDecision[]): Promise<ExecuteResponse> {
    return this.request('POST', '/api/import?action=execute', { decisions });
  }
}
