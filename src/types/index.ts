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
    browser: 'chromium' | 'firefox' | 'webkit';
    viewport: { width: number; height: number };
    waitForSelector?: string | undefined;
    timeout: number;
}

export interface WebviewMessage {
    type: string;
    payload: any;
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