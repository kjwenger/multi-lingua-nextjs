import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { resetTranslationService } from '@/lib/translation-providers';
import { apiLogger } from '@/lib/logger';

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

function getDb(): sqlite3.Database {
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
  `);

  // Add email column if it doesn't exist (for existing databases)
  db.run(`ALTER TABLE provider_configs ADD COLUMN email TEXT`, () => {});
  // Add app_id column if it doesn't exist (for Oxford)
  db.run(`ALTER TABLE provider_configs ADD COLUMN app_id TEXT`, () => {});

  db.run(`
    CREATE TABLE IF NOT EXISTS provider_fallback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_type TEXT NOT NULL,
      priority INTEGER NOT NULL
    )
  `);
  
  return db;
}

export async function GET() {
  return new Promise((resolve) => {
    const db = getDb();
    
    db.all('SELECT * FROM provider_configs', (err, providers: any[]) => {
      if (err) {
        db.close();
        resolve(NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 }));
        return;
      }

      db.close();
      
      resolve(NextResponse.json({ 
        providers: providers || []
      }));
    });
  });
}

export async function POST(request: NextRequest) {
  return new Promise(async (resolve) => {
    const body = await request.json();
    const { type, enabled, apiKey, apiUrl, region, email, appId } = body;

    if (!type) {
      resolve(NextResponse.json({ error: 'Provider type is required' }, { status: 400 }));
      return;
    }

    const db = getDb();

    apiLogger.info(`Saving config for ${type}: enabled=${enabled}, apiUrl=${apiUrl || 'none'}, email=${email || 'none'}, appId=${appId || 'none'}`);

    db.run(`
      INSERT INTO provider_configs (type, enabled, api_key, api_url, region, email, app_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(type) DO UPDATE SET
        enabled = excluded.enabled,
        api_key = excluded.api_key,
        api_url = excluded.api_url,
        region = excluded.region,
        email = excluded.email,
        app_id = excluded.app_id
    `, [type, enabled ? 1 : 0, apiKey || null, apiUrl || null, region || null, email || null, appId || null], (err) => {
      if (err) {
        db.close();
        apiLogger.error('Error saving provider config', err);
        resolve(NextResponse.json({ error: 'Failed to save provider config' }, { status: 500 }));
        return;
      }

      // If this provider is being enabled, set it as the active provider
      if (enabled) {
        apiLogger.info(`Provider ${type} is now ENABLED, setting as active`);
        db.run(`
          INSERT INTO settings (key, value)
          VALUES ('active_provider', ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `, [type], (settingsErr) => {
          db.close();
          if (settingsErr) {
            apiLogger.error('Error setting active provider', settingsErr);
          }
          // Reset the cached TranslationService so it picks up the new config
          resetTranslationService();
          resolve(NextResponse.json({ success: true }));
        });
      } else {
        db.close();
        apiLogger.info(`Provider ${type} is now DISABLED`);
        // Reset the cached TranslationService so it picks up the new config
        resetTranslationService();
        resolve(NextResponse.json({ success: true }));
      }
    });
  });
}


