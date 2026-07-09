import { ILogger } from './ILogger';

export class ConsoleLogger implements ILogger {
  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  }

  debug(message: string, ...meta: any[]): void {
    console.debug(this.formatMessage('debug', message), ...meta);
  }

  info(message: string, ...meta: any[]): void {
    console.info(this.formatMessage('info', message), ...meta);
  }

  warn(message: string, ...meta: any[]): void {
    console.warn(this.formatMessage('warn', message), ...meta);
  }

  error(message: string, error?: any, ...meta: any[]): void {
    const formatted = this.formatMessage('error', message);
    if (error !== undefined) {
      console.error(formatted, error, ...meta);
    } else {
      console.error(formatted, ...meta);
    }
  }
}
