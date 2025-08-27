import * as vscode from 'vscode';

export class Logger {
    private readonly outputChannel: vscode.OutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('DOM Agent');
    }

    public info(message: string, ...args: any[]): void {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] INFO: ${message}`;
        this.outputChannel.appendLine(formattedMessage);
        
        if (args.length > 0) {
            this.outputChannel.appendLine(`  Args: ${JSON.stringify(args, null, 2)}`);
        }
    }

    public error(message: string, error?: any): void {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] ERROR: ${message}`;
        this.outputChannel.appendLine(formattedMessage);
        
        if (error) {
            this.outputChannel.appendLine(`  Error: ${error.message || error}`);
            if (error.stack) {
                this.outputChannel.appendLine(`  Stack: ${error.stack}`);
            }
        }
        
        this.outputChannel.show();
    }

    public warn(message: string, ...args: any[]): void {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] WARN: ${message}`;
        this.outputChannel.appendLine(formattedMessage);
        
        if (args.length > 0) {
            this.outputChannel.appendLine(`  Args: ${JSON.stringify(args, null, 2)}`);
        }
    }

    public debug(message: string, ...args: any[]): void {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] DEBUG: ${message}`;
        this.outputChannel.appendLine(formattedMessage);
        
        if (args.length > 0) {
            this.outputChannel.appendLine(`  Args: ${JSON.stringify(args, null, 2)}`);
        }
    }
}