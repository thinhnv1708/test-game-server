import { ILogger } from './ILogger';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITIES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export class ConsoleLogger implements ILogger {
  private level: LogLevel;

  constructor(level: string = 'info') {
    const normalizedLevel = level.toLowerCase() as LogLevel;
    this.level = LEVEL_PRIORITIES[normalizedLevel] !== undefined ? normalizedLevel : 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITIES[level] >= LEVEL_PRIORITIES[this.level];
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  }

  debug(message: string, ...meta: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), ...meta);
    }
  }

  info(message: string, ...meta: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...meta);
    }
  }

  warn(message: string, ...meta: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...meta);
    }
  }

  error(message: string, error?: any, ...meta: any[]): void {
    if (this.shouldLog('error')) {
      const formatted = this.formatMessage('error', message);
      if (error !== undefined) {
        console.error(formatted, error, ...meta);
      } else {
        console.error(formatted, ...meta);
      }
    }
  }
}
