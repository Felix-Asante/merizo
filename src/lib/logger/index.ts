export class Logger {
  private readonly context: string;

  constructor(context: string) {
    this.context = context;
  }

  debug(message: string, extra?: Record<string, any>) {
    console.debug(`[${this.context}] [DEBUG] ${message}`, extra);
  }

  info(message: string, extra?: Record<string, any>) {
    console.info(`[${this.context}] [INFO] ${message}`, extra);
  }

  warning(message: string, extra?: Record<string, any>) {
    console.warn(`[${this.context}] [WARNING] ${message}`, extra);
  }

  error(message: string, error?: Error, extra?: Record<string, any>) {
    console.error(`[${this.context}] [ERROR] ${message}`, error, extra);
  }

  fatal(message: string, error?: Error, extra?: Record<string, any>) {
    console.error(`[${this.context}] [FATAL] ${message}`, error, extra);
  }
}
