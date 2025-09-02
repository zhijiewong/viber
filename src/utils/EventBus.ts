import { EventEmitter } from 'eventemitter3';
import { Logger } from './logger';
import { ElementInfo } from '../types';

export interface DOMAgentEvents {
    'element-selected': (element: ElementInfo) => void;
    'element:selected': (element: ElementInfo) => void;
    'element-hovered': (element: ElementInfo) => void;
    'element-unhovered': () => void;
    'inspector-opened': () => void;
    'inspector-closed': () => void;
    'capture-requested': (url: string) => void;
    'capture:started': () => void;
    'capture:completed': (snapshot: any) => void;
    'capture:refresh-requested': () => void;
    'capture-completed': (snapshot: any) => void;
    'capture-failed': (error: Error) => void;
    'cursor:chat-requested': (data: { element: ElementInfo; framework: string; type: string }) => void;
    'cursor:chat-opened': (data: { element: ElementInfo; framework: string; type: string; prompt: string }) => void;
    'clipboard:copy-requested': (data: { text: string; type?: string }) => void;
    'clipboard:copy-completed': (data: { text: string; type?: string }) => void;
    'webview:message': (message: any) => void;
    'error:occurred': (error: Error) => void;
}

export class EventBus extends EventEmitter<DOMAgentEvents> {
    private static instance: EventBus;
    private readonly logger: Logger;

    private constructor() {
        super();
        this.logger = new Logger();
        this.setupEventLogging();
    }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    private setupEventLogging(): void {
        // Log all events for debugging
        const originalEmit = this.emit.bind(this);
        this.emit = (event: any, ...args: any[]) => {
            this.logger.debug(`Event emitted: ${event}`, { args });
            return originalEmit(event, ...args);
        };
    }

    public emitElementSelected(element: ElementInfo): void {
        this.logger.info('Element selected', { 
            tag: element.tag, 
            id: element.id, 
            classes: element.classes 
        });
        this.emit('element-selected', element);
    }

    public emitElementHovered(element: ElementInfo): void {
        this.emit('element-hovered', element);
    }

    public emitElementUnhovered(): void {
        this.emit('element-unhovered');
    }

    public emitInspectorOpened(): void {
        this.logger.info('Inspector opened');
        this.emit('inspector-opened');
    }

    public emitInspectorClosed(): void {
        this.logger.info('Inspector closed');
        this.emit('inspector-closed');
    }

    public emitCaptureRequested(url: string): void {
        this.logger.info('Capture requested', { url });
        this.emit('capture-requested', url);
    }

    public emitCaptureCompleted(snapshot: any): void {
        this.logger.info('Capture completed', { 
            url: snapshot.url, 
            elements: snapshot.elements?.length 
        });
        this.emit('capture-completed', snapshot);
    }

    public emitCaptureFailed(error: Error): void {
        this.logger.error('Capture failed', error);
        this.emit('capture-failed', error);
    }
}

// Global event bus instance
export const eventBus = EventBus.getInstance();