// Re-export common types from the main project
export interface ElementInfo {
  tag: string;
  id?: string;
  classes: string[];
  textContent: string;
  attributes: Record<string, string>;
  cssSelector: string;
  xpath: string;
  boundingBox: BoundingBox;
  computedStyles: Record<string, string>;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DOMSnapshot {
  html: string;
  css: string;
  url: string;
  timestamp: Date;
  viewport: { width: number; height: number };
  elements: ElementMetadata[];
  screenshot?: string; // base64 encoded
}

export interface ElementMetadata {
  selector: string;
  boundingBox: BoundingBox;
  tag: string;
  id?: string;
  classes: string[];
}

export interface CaptureOptions {
  browser?: 'chromium' | 'firefox' | 'webkit';
  viewport?: { width: number; height: number };
  waitForSelector?: string;
  timeout?: number;
  fullPage?: boolean;
  includeStyles?: boolean;
  includeScripts?: boolean;
  maxDepth?: number;
}

export interface WebviewMessage<T = unknown> {
  type: string;
  payload: T;
}

export interface ElementSelectionMessage extends WebviewMessage {
  type: 'element-selected';
  payload: {
    element: ElementInfo;
    position: { x: number; y: number };
  };
}

export interface GenerateCodeMessage extends WebviewMessage {
  type: 'generate-code';
  payload: {
    element: ElementInfo;
    framework: 'react' | 'vue' | 'angular' | 'vanilla';
    type: 'component' | 'test' | 'selector';
  };
}

// Chrome Extension specific types
export interface ExtensionMessage {
  type: string;
  payload?: any;
  tabId?: number;
}

export interface Settings {
  autoDetectDevServer: boolean;
  advancedMode: boolean;
  hoverInspection: boolean;
  codeGenerationFramework: 'react' | 'vue' | 'angular' | 'vanilla';
}

export interface StatusMessage {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface DevToolsMessage extends ExtensionMessage {
  type: 'devtools-action';
  payload: {
    action: 'inspect' | 'capture' | 'generate' | 'highlight';
    data?: any;
  };
}

export interface ContentScriptMessage extends ExtensionMessage {
  type: 'content-script-action';
  payload: {
    action: 'start-inspection' | 'stop-inspection' | 'capture-dom' | 'generate-code';
    options?: any;
  };
}

export interface BackgroundMessage extends ExtensionMessage {
  type: 'background-action';
  payload: {
    action: 'update-settings' | 'get-settings' | 'open-devtools';
    data?: any;
  };
}

// Chrome API type extensions
declare global {
  interface Window {
    chrome: typeof chrome;
  }
}
