// Logger simple
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = string | number | boolean | Record<string, unknown> | Error | unknown | null | undefined;

class Logger {
  log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`);
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: LogContext) {
    this.log('error', message, error);
  }
}

export const logger = new Logger();
