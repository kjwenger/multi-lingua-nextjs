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

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  preferred_language: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  created_by: number | null;
}

export interface AuthCode {
  id: number;
  user_id: number | null;
  email: string;
  code: string;
  code_type: 'registration' | 'login';
  attempts: number;
  max_attempts: number;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface Session {
  id: number;
  user_id: number;
  token: string;
  device_info: string | null;
  ip_address: string | null;
  expires_at: string;
  last_activity: string;
  created_at: string;
}

export interface SystemConfig {
  id: number;
  config_key: string;
  config_value: string;
  description: string | null;
  updated_at: string;
  updated_by: number | null;
}

export interface UserActivityLog {
  id: number;
  user_id: number;
  action: string;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

export class AuthDatabase {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath);
    this.initializeAuthTables();
  }

  private initializeAuthTables() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
        preferred_language TEXT DEFAULT 'en',
        is_active BOOLEAN DEFAULT 1,
        email_verified BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        created_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS auth_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        code_type TEXT NOT NULL CHECK(code_type IN ('registration', 'login')),
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 3,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        device_info TEXT,
        ip_address TEXT,
        expires_at DATETIME NOT NULL,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS system_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        config_key TEXT UNIQUE NOT NULL,
        config_value TEXT NOT NULL,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER,
        FOREIGN KEY (updated_by) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS user_activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_auth_codes_email ON auth_codes(email)`,
      `CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key)`
    ];

    this.db.serialize(() => {
      queries.forEach((query) => {
        this.db.run(query, (err: Error | null) => {
          if (err) {
            console.error('Error creating auth table:', err);
          }
        });
      });

      this.insertDefaultConfig();
    });
  }

  private insertDefaultConfig() {
    const defaults = [
      ['session_timeout_minutes', '1440', 'Session timeout in minutes (default: 24 hours)'],
      ['code_expiry_minutes', '10', 'Authentication code expiry in minutes'],
      ['max_code_attempts', '3', 'Maximum attempts for authentication code'],
      ['require_email_verification', 'true', 'Require email verification for new accounts'],
      ['allow_self_registration', 'true', 'Allow users to self-register']
    ];

    defaults.forEach(([key, value, description]) => {
      this.db.run(
        'INSERT OR IGNORE INTO system_config (config_key, config_value, description) VALUES (?, ?, ?)',
        [key, value, description]
      );
    });
  }

  // User methods
  public getUserByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE email = ?', [email], (err: Error | null, row: User) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  public getUserById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE id = ?', [id], (err: Error | null, row: User) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  public createUser(data: {
    email: string;
    full_name: string;
    role?: 'admin' | 'user';
    preferred_language?: string;
    email_verified?: boolean;
    created_by?: number;
  }): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users (email, full_name, role, preferred_language, email_verified, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      this.db.run(query, [
        data.email,
        data.full_name,
        data.role || 'user',
        data.preferred_language || 'en',
        data.email_verified ? 1 : 0,
        data.created_by || null
      ], function(this: sqlite3.RunResult, err: Error | null) {
        if (err) reject(err);
        else resolve(this.lastID as number);
      });
    });
  }

  public updateUser(id: number, data: Partial<User>): Promise<void> {
    return new Promise((resolve, reject) => {
      const fields: string[] = [];
      const values: any[] = [];

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'created_at') {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });

      if (fields.length === 0) {
        resolve();
        return;
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      this.db.run(query, values, (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  public updateLastLogin(userId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [userId],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  public getAllUsers(filters?: {
    search?: string;
    role?: string;
    isActive?: boolean;
    page?: number;
    perPage?: number;
  }): Promise<{ users: User[]; total: number }> {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM users WHERE 1=1';
      const params: any[] = [];

      if (filters?.search) {
        query += ' AND (email LIKE ? OR full_name LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (filters?.role) {
        query += ' AND role = ?';
        params.push(filters.role);
      }

      if (filters?.isActive !== undefined) {
        query += ' AND is_active = ?';
        params.push(filters.isActive ? 1 : 0);
      }

      this.db.get('SELECT COUNT(*) as count FROM (' + query + ')', params, (err: Error | null, countRow: any) => {
        if (err) {
          reject(err);
          return;
        }

        const total = countRow.count;
        query += ' ORDER BY created_at DESC';

        if (filters?.page && filters?.perPage) {
          const offset = (filters.page - 1) * filters.perPage;
          query += ' LIMIT ? OFFSET ?';
          params.push(filters.perPage, offset);
        }

        this.db.all(query, params, (err: Error | null, rows: User[]) => {
          if (err) reject(err);
          else resolve({ users: rows || [], total });
        });
      });
    });
  }

  // Auth code methods
  public createAuthCode(data: {
    email: string;
    code: string;
    code_type: 'registration' | 'login';
    user_id?: number;
    max_attempts?: number;
    expiresInMinutes?: number;
  }): Promise<number> {
    return new Promise((resolve, reject) => {
      const expiryMinutes = data.expiresInMinutes || 10;
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();

      const query = `
        INSERT INTO auth_codes (user_id, email, code, code_type, max_attempts, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      this.db.run(query, [
        data.user_id || null,
        data.email,
        data.code,
        data.code_type,
        data.max_attempts || 3,
        expiresAt
      ], function(this: sqlite3.RunResult, err: Error | null) {
        if (err) reject(err);
        else resolve(this.lastID as number);
      });
    });
  }

  public getAuthCode(email: string, code: string, codeType: 'registration' | 'login'): Promise<AuthCode | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM auth_codes 
        WHERE email = ? AND code = ? AND code_type = ? AND used = 0 AND expires_at > datetime('now')
        ORDER BY created_at DESC LIMIT 1
      `;
      this.db.get(query, [email, code, codeType], (err: Error | null, row: AuthCode) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  public incrementAuthCodeAttempts(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('UPDATE auth_codes SET attempts = attempts + 1 WHERE id = ?', [id], (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  public markAuthCodeAsUsed(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('UPDATE auth_codes SET used = 1 WHERE id = ?', [id], (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Session methods
  public createSession(data: {
    user_id: number;
    token: string;
    device_info?: string;
    ip_address?: string;
    expiresInMinutes?: number;
  }): Promise<number> {
    return new Promise((resolve, reject) => {
      const expiryMinutes = data.expiresInMinutes || 1440;
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();

      const query = `
        INSERT INTO sessions (user_id, token, device_info, ip_address, expires_at)
        VALUES (?, ?, ?, ?, ?)
      `;
      this.db.run(query, [
        data.user_id,
        data.token,
        data.device_info || null,
        data.ip_address || null,
        expiresAt
      ], function(this: sqlite3.RunResult, err: Error | null) {
        if (err) reject(err);
        else resolve(this.lastID as number);
      });
    });
  }

  public getSessionByToken(token: string): Promise<Session | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM sessions 
        WHERE token = ? AND expires_at > datetime('now')
      `;
      this.db.get(query, [token], (err: Error | null, row: Session) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  public updateSessionActivity(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE sessions SET last_activity = CURRENT_TIMESTAMP WHERE token = ?',
        [token],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  public deleteSession(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM sessions WHERE token = ?', [token], (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  public getUserSessions(userId: number): Promise<Session[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM sessions WHERE user_id = ? AND expires_at > datetime("now") ORDER BY last_activity DESC',
        [userId],
        (err: Error | null, rows: Session[]) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  public deleteUserSession(userId: number, sessionId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM sessions WHERE id = ? AND user_id = ?',
        [sessionId, userId],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // System config methods
  public getConfig(key: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT config_value FROM system_config WHERE config_key = ?',
        [key],
        (err: Error | null, row: any) => {
          if (err) reject(err);
          else resolve(row?.config_value || null);
        }
      );
    });
  }

  public getAllConfig(): Promise<SystemConfig[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM system_config', (err: Error | null, rows: SystemConfig[]) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  public updateConfig(key: string, value: string, updatedBy?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE system_config 
        SET config_value = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
        WHERE config_key = ?
      `;
      this.db.run(query, [value, updatedBy || null, key], (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Activity log methods
  public logActivity(data: {
    user_id: number;
    action: string;
    details?: string;
    ip_address?: string;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO user_activity_log (user_id, action, details, ip_address)
        VALUES (?, ?, ?, ?)
      `;
      this.db.run(query, [
        data.user_id,
        data.action,
        data.details || null,
        data.ip_address || null
      ], (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  public getActivityLog(filters?: {
    userId?: number;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    perPage?: number;
  }): Promise<{ logs: UserActivityLog[]; total: number }> {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM user_activity_log WHERE 1=1';
      const params: any[] = [];

      if (filters?.userId) {
        query += ' AND user_id = ?';
        params.push(filters.userId);
      }

      if (filters?.action) {
        query += ' AND action = ?';
        params.push(filters.action);
      }

      if (filters?.startDate) {
        query += ' AND created_at >= ?';
        params.push(filters.startDate);
      }

      if (filters?.endDate) {
        query += ' AND created_at <= ?';
        params.push(filters.endDate);
      }

      this.db.get('SELECT COUNT(*) as count FROM (' + query + ')', params, (err: Error | null, countRow: any) => {
        if (err) {
          reject(err);
          return;
        }

        const total = countRow.count;
        query += ' ORDER BY created_at DESC';

        if (filters?.page && filters?.perPage) {
          const offset = (filters.page - 1) * filters.perPage;
          query += ' LIMIT ? OFFSET ?';
          params.push(filters.perPage, offset);
        }

        this.db.all(query, params, (err: Error | null, rows: UserActivityLog[]) => {
          if (err) reject(err);
          else resolve({ logs: rows || [], total });
        });
      });
    });
  }

  public close() {
    this.db.close();
  }
}

export const authDatabase = new AuthDatabase();
