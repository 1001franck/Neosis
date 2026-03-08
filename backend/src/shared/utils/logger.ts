/**
 * =====================================================
 * Utilitaire Logger structuré
 * =====================================================
 * 
 * À utiliser partout pour logger
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';
type LogData = string | number | boolean | Record<string, unknown> | Error | unknown | null | undefined;

/**
 * Logger structuré
 * 
 * Utilisation:
 * const logger = new Logger('MyClass');
 * logger.info('Something happened', { userId: 123 });
 */
export class Logger {
  constructor(private context: string) {}

  info(message: string, data?: LogData): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: LogData): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: LogData): void {
    this.log('error', message, error);
  }

  debug(message: string, data?: LogData): void {
    if (process.env.DEBUG === 'true') {
      this.log('debug', message, data);
    }
  }

  private log(level: LogLevel, message: string, data?: LogData): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.context}]`;

    switch (level) {
      case 'info':
        console.log(`${prefix} ℹ️  ${message}`, data ?? '');
        break;
      case 'warn':
        console.warn(`${prefix} ⚠️  ${message}`, data ?? '');
        break;
      case 'error':
        console.error(`${prefix} ❌ ${message}`, data ?? '');
        break;
      case 'debug':
        console.debug(`${prefix} 🐛 ${message}`, data ?? '');
        break;
    }
  }
}


