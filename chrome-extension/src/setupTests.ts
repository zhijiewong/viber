// Jest setup file for Chrome Extension testing
import 'jest-environment-jsdom';

// Mock Chrome APIs
const mockChrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn()
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn()
    }
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    onInstalled: {
      addListener: jest.fn()
    },
    getManifest: jest.fn(() => ({
      version: '0.1.3',
      name: 'DOM Agent'
    })),
    lastError: null
  },
  tabs: {
    query: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    sendMessage: jest.fn(),
    onUpdated: {
      addListener: jest.fn()
    }
  },
  contextMenus: {
    create: jest.fn(),
    remove: jest.fn(),
    removeAll: jest.fn(),
    onClicked: {
      addListener: jest.fn()
    }
  },
  debugger: {
    attach: jest.fn(),
    detach: jest.fn()
  },
  devtools: {
    inspectedWindow: {
      tabId: 1,
      eval: jest.fn()
    },
    panels: {
      create: jest.fn(),
      elements: {
        createSidebarPane: jest.fn()
      },
      network: {
        createSidebarPane: jest.fn()
      }
    }
  }
};

// Mock fetch for API calls
global.fetch = jest.fn();

// Setup global Chrome API
Object.defineProperty(global, 'chrome', {
  value: mockChrome,
  writable: true
});

// Mock localStorage and sessionStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};

const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: jest.fn().mockImplementation(() => ({
    getPropertyValue: jest.fn().mockReturnValue(''),
    setProperty: jest.fn(),
    removeProperty: jest.fn()
  }))
});

// Mock DOMRect with proper typing
interface MockDOMRect extends DOMRect {
  toJSON(): any;
}

const createMockDOMRect = (x = 0, y = 0, width = 0, height = 0): MockDOMRect => ({
  x,
  y,
  width,
  height,
  top: y,
  left: x,
  bottom: y + height,
  right: x + width,
  toJSON: jest.fn()
});

const MockDOMRectConstructor = jest.fn().mockImplementation(createMockDOMRect) as any;

// Add static fromRect method
MockDOMRectConstructor.fromRect = jest.fn().mockImplementation((other?: any) => {
  return createMockDOMRect(other?.x || 0, other?.y || 0, other?.width || 0, other?.height || 0);
});

global.DOMRect = MockDOMRectConstructor;

// Custom matchers
expect.extend({
  toBeValidElement(received: any) {
    const pass = received &&
                typeof received === 'object' &&
                received.tagName &&
                received.getBoundingClientRect &&
                received.getAttribute;

    return {
      message: () => `expected ${received} to be a valid DOM element`,
      pass
    };
  },

  toHaveBeenCalledWithTabId(received: any, tabId: number) {
    const calls = received.mock.calls;
    const pass = calls.some((call: any[]) => call[0] === tabId);

    return {
      message: () => `expected ${received} to have been called with tabId ${tabId}`,
      pass
    };
  }
});

// Test utilities
(global as any).testUtils = {
  createMockElement: (tagName = 'div', options: any = {}) => {
    const element = {
      tagName: tagName.toUpperCase(),
      id: options.id || '',
      className: options.className || '',
      textContent: options.textContent || '',
      getAttribute: jest.fn((attr: string) => {
        switch (attr) {
          case 'id': return options.id || null;
          case 'class': return options.className || null;
          default: return null;
        }
      }),
      setAttribute: jest.fn(),
      getBoundingClientRect: jest.fn(() => createMockDOMRect(0, 0, 100, 100)),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      ...options
    };
    return element;
  },

  createMockTab: (id = 1, options: any = {}) => ({
    id,
    url: options.url || 'https://example.com',
    title: options.title || 'Test Page',
    active: options.active !== false,
    windowId: options.windowId || 1,
    ...options
  }),

  mockFetchResponse: (data: any, options: any = {}) => {
    return Promise.resolve({
      ok: options.ok !== false,
      status: options.status || 200,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      ...options
    });
  },

  waitForNextTick: () => new Promise(resolve => setImmediate(resolve))
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});
