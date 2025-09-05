import * as vscode from 'vscode';
import * as winston from 'winston';

type LogMeta = Record<string, unknown> | undefined;

export class Logger {
  private static instance: Logger;
  private readonly outputChannel: vscode.OutputChannel;
  private readonly winstonLogger: winston.Logger;

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel('DOM Agent');

    // Create winston logger with custom transport for VS Code
    this.winstonLogger = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        // Custom transport that writes to VS Code output channel
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
      ],
    });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public info(message: string, meta?: LogMeta): void {
    this.winstonLogger.info(message, meta);
    this.outputToVSCode('INFO', message, meta);
  }

  public error(message: string, error?: unknown): void {
    this.winstonLogger.error(message, { error });
    this.outputToVSCode('ERROR', message, error);
    this.outputChannel.show();
  }

  public warn(message: string, meta?: LogMeta): void {
    this.winstonLogger.warn(message, meta);
    this.outputToVSCode('WARN', message, meta);
  }

  public debug(message: string, meta?: LogMeta): void {
    this.winstonLogger.debug(message, meta);
    this.outputToVSCode('DEBUG', message, meta);
  }

  private outputToVSCode(level: string, message: string, meta?: unknown): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${level}: ${message}`;
    this.outputChannel.appendLine(formattedMessage);

    if (meta) {
      if (meta instanceof Error) {
        this.outputChannel.appendLine(`  Error: ${meta.message}`);
        if (meta.stack) {
          this.outputChannel.appendLine(`  Stack: ${meta.stack}`);
        }
      } else if (typeof meta === 'object') {
        this.outputChannel.appendLine(`  Meta: ${JSON.stringify(meta, null, 2)}`);
      } else {
        this.outputChannel.appendLine(`  Meta: ${String(meta)}`);
      }
    }
  }
}
