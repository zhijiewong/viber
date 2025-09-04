import { EventEmitter } from 'eventemitter3';
import { Logger } from './logger';
import { ElementInfo, DOMSnapshot, WebviewMessage } from '../types';

export interface DOMAgentEvents {
  'element-selected': (element: ElementInfo) => void;
  'element:selected': (element: ElementInfo) => void;
  'element-hovered': (element: ElementInfo) => void;
  'element-unhovered': () => void;
  'inspector-opened': () => void;
  'inspector-closed': () => void;
  'capture-requested': (url: string) => void;
  'capture:started': () => void;
  'capture:completed': (snapshot: DOMSnapshot) => void;
  'capture:refresh-requested': () => void;
  'capture-completed': (snapshot: DOMSnapshot) => void;
  'capture-failed': (error: Error) => void;
  'cursor:chat-requested': (data: {
    element: ElementInfo;
    framework: string;
    type: string;
  }) => void;
  'cursor:chat-opened': (data: {
    element: ElementInfo;
    framework: string;
    type: string;
    prompt: string;
  }) => void;
  'clipboard:copy-requested': (data: { text: string; type?: string }) => void;
  'clipboard:copy-completed': (data: { text: string; type?: string }) => void;
  'webview:message': (message: WebviewMessage) => void;
  'error:occurred': (error: Error) => void;
}

export class EventBus extends EventEmitter<DOMAgentEvents> {
  private static instance: EventBus;
  private readonly logger: Logger;

  private constructor() {
    super();
    this.logger = Logger.getInstance();
    this.setupEventLogging();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  private setupEventLogging(): void {
    // Event logging disabled to avoid TypeScript strict typing issues
    // This can be re-enabled when a better typing solution is found
  }

  public emitElementSelected(element: ElementInfo): void {
    this.logger.info('Element selected', {
      tag: element.tag,
      id: element.id,
      classes: element.classes,
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

  public emitCaptureCompleted(snapshot: DOMSnapshot): void {
    this.logger.info('Capture completed', {
      url: snapshot.url,
      elements: snapshot.elements?.length,
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
