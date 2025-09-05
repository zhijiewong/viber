import { DOMSnapshot, ElementInfo } from './index';

export interface WebviewState {
  snapshot: DOMSnapshot | null;
  selectedElement: ElementInfo | null;
  isLoading: boolean;
  error: string | null;
}

export interface WebviewMessageMap {
  'dom-snapshot': {
    type: 'dom-snapshot';
    payload: DOMSnapshot;
  };
  'element-highlight': {
    type: 'element-highlight';
    payload: { selector: string; highlight: boolean };
  };
  'copy-to-clipboard': {
    type: 'copy-to-clipboard';
    payload: { data: string; format: 'json' | 'css' | 'xpath' };
  };
  'generate-code': {
    type: 'generate-code';
    payload: {
      element: ElementInfo;
      options: CodeGenerationOptions;
    };
  };
}

export interface CodeGenerationOptions {
  framework: 'react' | 'vue' | 'angular' | 'vanilla';
  type: 'component' | 'test' | 'selector';
  includeStyles: boolean;
  includeAccessibility: boolean;
}
