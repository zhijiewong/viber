export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    // Initialize with default log level, then try to load from storage
    this.initializeLogLevel();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private initializeLogLevel(): void {
    // Set default log level first
    this.logLevel = LogLevel.INFO;

    // Try to load from storage asynchronously, but don't block initialization
    this.loadLogLevelFromStorage().catch(() => {
      // Silently ignore storage errors - use default log level
      console.log('DOM Agent: Using default log level due to storage unavailable');
    });
  }

  private async loadLogLevelFromStorage(): Promise<void> {
    try {
      // Check if chrome API is available and storage is accessible
      if (typeof chrome !== 'undefined' &&
          chrome.storage &&
          chrome.storage.sync &&
          typeof chrome.storage.sync.get === 'function') {

        const result = await chrome.storage.sync.get({ logLevel: 'INFO' });
        const levelString = result.logLevel as string;

        if (levelString && LogLevel[levelString as keyof typeof LogLevel] !== undefined) {
          this.logLevel = LogLevel[levelString as keyof typeof LogLevel];
          console.log(`DOM Agent: Log level set to ${levelString}`);
        }
      }
    } catch (error) {
      // Storage not available or failed - silently use default
      console.log('DOM Agent: Storage access failed, using default log level');
    }
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] DOM Agent:`;

    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
    }

    return `${prefix} ${message}`;
  }

  public debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formattedMessage = this.formatMessage('DEBUG', message, data);
      console.debug(formattedMessage);
    }
  }

  public info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formattedMessage = this.formatMessage('INFO', message, data);
      console.info(formattedMessage);
    }
  }

  public warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formattedMessage = this.formatMessage('WARN', message, data);
      console.warn(formattedMessage);
    }
  }

  public error(message: string, error?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = this.formatMessage('ERROR', message, error);
      console.error(formattedMessage);

      // In production, we might want to send errors to a logging service
      if (!this.isDevelopment && typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        // Send error to background script for potential reporting
        try {
          chrome.runtime.sendMessage({
            type: 'LOG_ERROR',
            payload: { message, error, timestamp: new Date().toISOString() }
          }).catch(() => {
            // Ignore if background script is not available
          });
        } catch (e) {
          // Ignore errors in error reporting
        }
      }
    }
  }

  public log(level: LogLevel, message: string, data?: any): void {
    switch (level) {
      case LogLevel.DEBUG:
        this.debug(message, data);
        break;
      case LogLevel.INFO:
        this.info(message, data);
        break;
      case LogLevel.WARN:
        this.warn(message, data);
        break;
      case LogLevel.ERROR:
        this.error(message, data);
        break;
    }
  }

  // Convenience methods for Chrome extension specific logging
  public logExtensionAction(action: string, data?: any): void {
    this.info(`Extension action: ${action}`, data);
  }

  public logContentScriptAction(action: string, data?: any): void {
    this.debug(`Content script action: ${action}`, data);
  }

  public logBackgroundAction(action: string, data?: any): void {
    this.debug(`Background action: ${action}`, data);
  }
}
