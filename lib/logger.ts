type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m',  // green
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
};

const RESET = '\x1b[0m';

class Logger {
  private minLevel: LogLevel;
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
    // Default to 'info', can be overridden by LOG_LEVEL env var
    // In browser, use NEXT_PUBLIC_LOG_LEVEL; on server, use LOG_LEVEL
    let envLevel: LogLevel | null = null;
    if (typeof window === 'undefined') {
      // Server-side
      envLevel = process.env?.LOG_LEVEL as LogLevel | null;
    } else {
      // Client-side - check if process.env exists (it won't in production)
      if (typeof process !== 'undefined' && process.env) {
        envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel | null;
      }
    }
    this.minLevel = envLevel && LOG_LEVELS[envLevel] !== undefined ? envLevel : 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase().padEnd(5);
    return `${timestamp} ${levelStr} [${this.context}] ${message}`;
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message);
    const color = LOG_COLORS[level];

    // Server-side logging (Node.js)
    if (typeof window === 'undefined') {
      if (data !== undefined) {
        console.log(`${color}${formattedMessage}${RESET}`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
      } else {
        console.log(`${color}${formattedMessage}${RESET}`);
      }
    }
    // Client-side logging (Browser)
    else {
      const styles = {
        debug: 'color: #0891b2',
        info: 'color: #16a34a',
        warn: 'color: #ca8a04',
        error: 'color: #dc2626',
      };

      if (data !== undefined) {
        console.log(`%c${formattedMessage}`, styles[level], data);
      } else {
        console.log(`%c${formattedMessage}`, styles[level]);
      }
    }
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  // Create a child logger with a different context
  child(context: string): Logger {
    return new Logger(`${this.context}:${context}`);
  }
}

// Pre-configured loggers for different parts of the app
export const logger = new Logger('App');
export const apiLogger = new Logger('API');
export const providerLogger = new Logger('Provider');
export const translateLogger = new Logger('Translate');

export function createLogger(context: string): Logger {
  return new Logger(context);
}
