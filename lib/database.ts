import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Use /app/data if running in Docker, otherwise use local app/data. Allow override via DATA_DIR env var.
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

// Ensure the data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'translations.db');

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
}

export class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS translations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        english TEXT NOT NULL,
        german TEXT,
        french TEXT,
        italian TEXT,
        spanish TEXT,
        english_proposals TEXT,
        german_proposals TEXT,
        french_proposals TEXT,
        italian_proposals TEXT,
        spanish_proposals TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.serialize(() => {
      this.db.run(createTableQuery, (err: Error | null) => {
        if (err) {
          console.error('Error creating table:', err);
        } else {
          console.log('Database initialized successfully');
        }
      });
      this.addGermanColumn();
      this.addEnglishProposalsColumn();
      this.addUserIdColumn();
    });
  }

  private addUserIdColumn() {
    // Add user_id column - NULL means shared translation (accessible to all)
    this.db.run('ALTER TABLE translations ADD COLUMN user_id INTEGER REFERENCES users(id)', (err: Error | null) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding user_id column:', err);
      }
    });
  }

  private addGermanColumn() {
    this.db.run('ALTER TABLE translations ADD COLUMN german TEXT', (err: Error | null) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding german column:', err);
      }
    });
    this.db.run('ALTER TABLE translations ADD COLUMN german_proposals TEXT', (err: Error | null) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding german_proposals column:', err);
      }
    });
  }

  private addEnglishProposalsColumn() {
    this.db.run('ALTER TABLE translations ADD COLUMN english_proposals TEXT', (err: Error | null) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding english_proposals column:', err);
      }
    });
  }

  public getAllTranslations(userId?: number): Promise<Translation[]> {
    return new Promise((resolve, reject) => {
      // If userId provided, get user's own translations + shared translations (user_id IS NULL)
      // If no userId, get only shared translations
      const query = userId
        ? 'SELECT * FROM translations WHERE user_id = ? OR user_id IS NULL ORDER BY english ASC'
        : 'SELECT * FROM translations WHERE user_id IS NULL ORDER BY english ASC';
      const params = userId ? [userId] : [];

      this.db.all(query, params, (err: Error | null, rows: Translation[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  public getTranslationById(id: number): Promise<Translation | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM translations WHERE id = ?', [id], (err: Error | null, row: Translation) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  public addTranslation(data: {
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
    user_id?: number | null;
  }): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO translations
        (english, german, french, italian, spanish, english_proposals, german_proposals, french_proposals, italian_proposals, spanish_proposals, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(query, [
        data.english,
        data.german || '',
        data.french || '',
        data.italian || '',
        data.spanish || '',
        data.english_proposals || '',
        data.german_proposals || '',
        data.french_proposals || '',
        data.italian_proposals || '',
        data.spanish_proposals || '',
        data.user_id ?? null
      ], function(this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID as number);
        }
      });
    });
  }

  public updateTranslation(id: number, data: {
    english?: string;
    german?: string;
    french?: string;
    italian?: string;
    spanish?: string;
    english_proposals?: string;
    german_proposals?: string;
    french_proposals?: string;
    italian_proposals?: string;
    spanish_proposals?: string;
    user_id?: number | null;
  }, userId?: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const fields: string[] = [];
      const values: any[] = [];

      Object.entries(data).forEach(([key, value]: [string, any]) => {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });

      if (fields.length === 0) {
        resolve(true);
        return;
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      // If userId provided, only allow updating own translations or shared ones
      const query = userId
        ? `UPDATE translations SET ${fields.join(', ')} WHERE id = ? AND (user_id = ? OR user_id IS NULL)`
        : `UPDATE translations SET ${fields.join(', ')} WHERE id = ?`;

      if (userId) {
        values.push(userId);
      }

      this.db.run(query, values, function(this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  public deleteTranslation(id: number, userId?: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // If userId provided, only allow deleting own translations (not shared ones)
      const query = userId
        ? 'DELETE FROM translations WHERE id = ? AND user_id = ?'
        : 'DELETE FROM translations WHERE id = ?';
      const params = userId ? [id, userId] : [id];

      this.db.run(query, params, function(this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  public close() {
    this.db.close();
  }
}

export const database = new Database();
