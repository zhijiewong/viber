# Testing Guide - DOM Agent Chrome Extension

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Manual Testing](#manual-testing)
- [Automated Testing](#automated-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)
- [Debugging](#debugging)
- [Continuous Integration](#continuous-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers comprehensive testing strategies for the DOM Agent Chrome Extension, including manual testing, automated unit tests, integration tests, and end-to-end testing.

### Testing Types

- **Unit Tests**: Individual functions and components
- **Integration Tests**: Component interactions and Chrome APIs
- **End-to-End Tests**: Complete user workflows
- **Performance Tests**: Speed and memory usage
- **Security Tests**: Input validation and API security

---

## Quick Start

### 1. Install Dependencies
```bash
cd chrome-extension
npm install
```

### 2. Run All Tests
```bash
npm test
```

### 3. Run Tests with Coverage
```bash
npm run test:coverage
```

### 4. Load Extension for Manual Testing
```bash
npm run build
# Then load dist/ folder in Chrome extensions
```

---

## Manual Testing

### Extension Loading

1. **Build the extension:**
   ```bash
   npm run build
   ```

2. **Load in Chrome:**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

3. **Verify loading:**
   - Extension icon should appear in toolbar
   - No console errors in background page
   - Popup should open without errors

### Basic Functionality Testing

#### DOM Inspection
1. **Navigate to a test page:**
   ```html
   <!-- Create test page: test-page.html -->
   <html>
   <body>
     <button class="btn btn-primary" id="test-btn">Click me</button>
     <div class="container">
       <h1>Test Page</h1>
       <p>This is a test paragraph</p>
     </div>
   </body>
   </html>
   ```

2. **Test inspection:**
   - Click extension icon
   - Click "Inspect Element"
   - Hover over elements (should highlight)
   - Click on button (should capture element info)
   - Verify element details in popup

#### Code Generation
1. **Select an element**
2. **Choose framework** (React/Vue/Angular/Vanilla)
3. **Generate code**
4. **Verify generated code** contains:
   - Correct element structure
   - Proper framework syntax
   - TypeScript types (if applicable)
   - Accessibility attributes

### DevTools Integration

1. **Open DevTools** (`F12`)
2. **Find DOM Agent panel**
3. **Test panel features:**
   - Element tree navigation
   - Properties display
   - Code generation
   - Settings access

### Context Menu Testing

1. **Right-click on webpage**
2. **Verify context menu items:**
   - "DOM Agent" submenu
   - "Inspect Element"
   - "Capture DOM Snapshot"
   - "Generate Code"
   - "Open DevTools Panel"

### Settings Testing

1. **Open extension popup**
2. **Test settings:**
   - Auto-detect dev server toggle
   - Advanced mode toggle
   - Hover inspection toggle
   - Framework selection

### Cross-Origin Testing

1. **Test on different domains:**
   - HTTP vs HTTPS sites
   - Different ports (localhost:3000, localhost:8080)
   - External websites (example.com, github.com)

2. **Verify CORS handling:**
   - Extension should work on allowed origins
   - Graceful error handling on restricted sites

---

## Automated Testing

### Unit Tests

#### Running Unit Tests
```bash
# Run all unit tests
npm test

# Run with watch mode
npm run test:watch

# Run specific test file
npm test -- utils/logger.test.ts

# Run tests matching pattern
npm test -- -t "Logger"
```

#### Test Structure
```typescript
// Example test file structure
describe('ComponentName', () => {
  let component: ComponentName;
  let mockDependency: jest.Mocked<Dependency>;

  beforeEach(() => {
    // Setup mocks and component
  });

  afterEach(() => {
    // Cleanup
    jest.clearAllMocks();
  });

  describe('Method Name', () => {
    it('should handle success case', () => {
      // Arrange
      const input = 'test input';
      const expected = 'expected output';

      // Act
      const result = component.method(input);

      // Assert
      expect(result).toBe(expected);
    });

    it('should handle error case', () => {
      // Test error scenarios
    });
  });
});
```

### Chrome API Mocking

#### Storage API Testing
```typescript
describe('Settings Manager', () => {
  beforeEach(() => {
    // Reset storage mock
    chrome.storage.sync.get.mockClear();
    chrome.storage.sync.set.mockClear();
  });

  it('should save settings to storage', async () => {
    const settings = { autoDetectDevServer: true };
    await settingsManager.saveSettings(settings);

    expect(chrome.storage.sync.set).toHaveBeenCalledWith(settings);
  });

  it('should load settings from storage', async () => {
    const mockSettings = { autoDetectDevServer: false };
    chrome.storage.sync.get.mockResolvedValue(mockSettings);

    const settings = await settingsManager.loadSettings();
    expect(settings.autoDetectDevServer).toBe(false);
  });
});
```

#### Runtime API Testing
```typescript
describe('Message Handler', () => {
  it('should send message to active tab', async () => {
    const mockTab = { id: 123 };
    chrome.tabs.query.mockResolvedValue([mockTab]);
    chrome.tabs.sendMessage.mockResolvedValue({ success: true });

    const result = await messageHandler.sendToActiveTab({ type: 'TEST' });

    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(123, { type: 'TEST' });
    expect(result.success).toBe(true);
  });
});
```

### DOM Testing

#### Element Mocking
```typescript
const createMockElement = (tagName = 'div', options = {}) => {
  return {
    tagName: tagName.toUpperCase(),
    id: options.id || '',
    className: options.className || '',
    textContent: options.textContent || '',
    getAttribute: jest.fn((attr) => {
      switch (attr) {
        case 'id': return options.id || null;
        case 'class': return options.className || null;
        default: return null;
      }
    }),
    getBoundingClientRect: jest.fn(() => ({
      x: 0, y: 0, width: 100, height: 100,
      top: 0, left: 0, bottom: 100, right: 100
    })),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    ...options
  };
};

describe('DOM Capture', () => {
  it('should capture element properties', () => {
    const mockElement = createMockElement('button', {
      id: 'test-btn',
      className: 'btn primary',
      textContent: 'Click me'
    });

    const result = domCapture.captureElement(mockElement);

    expect(result.tag).toBe('button');
    expect(result.id).toBe('test-btn');
    expect(result.classes).toContain('btn');
    expect(result.textContent).toBe('Click me');
  });
});
```

---

## Integration Testing

### Background Script Integration

#### Message Passing
```typescript
describe('Background Script Integration', () => {
  let backgroundService: BackgroundService;

  beforeEach(async () => {
    backgroundService = new BackgroundService();
    await backgroundService.initialize();
  });

  it('should handle DOM capture requests', async () => {
    const mockSender = { tab: { id: 123 } };
    const mockMessage = {
      type: 'CAPTURE_DOM',
      payload: { fullPage: true }
    };

    const response = await backgroundService.handleMessage(
      mockMessage,
      mockSender,
      jest.fn()
    );

    expect(response.success).toBe(true);
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(123, expect.any(Object));
  });
});
```

### Content Script Integration

#### DOM Interaction
```typescript
describe('Content Script Integration', () => {
  let contentScript: ContentScript;
  let mockDocument: Document;

  beforeEach(() => {
    mockDocument = {
      body: createMockElement('body'),
      querySelector: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    } as any;

    // Mock document
    Object.defineProperty(global, 'document', {
      value: mockDocument,
      writable: true
    });

    contentScript = new ContentScript();
  });

  it('should initialize element inspector', () => {
    expect(mockDocument.addEventListener).toHaveBeenCalledWith(
      'mouseover',
      expect.any(Function)
    );
  });
});
```

### Cross-Component Testing

#### End-to-End Message Flow
```typescript
describe('Message Flow Integration', () => {
  it('should handle complete inspection workflow', async () => {
    // 1. User clicks inspect button in popup
    // 2. Popup sends message to background
    // 3. Background forwards to content script
    // 4. Content script starts inspection
    // 5. User hovers over element
    // 6. Element info sent back through chain

    const workflow = new InspectionWorkflow();

    // Start workflow
    await workflow.startInspection();

    // Simulate user interaction
    await workflow.simulateHover(mockElement);

    // Verify complete flow
    expect(workflow.getCapturedElement()).toEqual(expectedElementInfo);
    expect(workflow.getGeneratedCode()).toContain('React');
  });
});
```

---

## End-to-End Testing

### Puppeteer Setup

#### Installation
```bash
npm install --save-dev puppeteer jest-puppeteer
```

#### Configuration
```javascript
// jest-puppeteer.config.js
module.exports = {
  launch: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  }
};
```

#### E2E Test Example
```typescript
describe('DOM Agent E2E', () => {
  beforeAll(async () => {
    await page.goto('https://example.com');
  });

  it('should inspect and generate code', async () => {
    // Load extension
    const extension = await loadExtension();

    // Open popup
    await page.click('#extension-icon');

    // Click inspect button
    await page.click('#inspectBtn');

    // Hover over element
    await page.hover('button');

    // Verify highlight overlay
    const overlay = await page.$('.dom-agent-overlay');
    expect(overlay).toBeTruthy();

    // Click element
    await page.click('button');

    // Verify code generation
    await page.waitForSelector('.generated-code');
    const code = await page.$eval('.generated-code', el => el.textContent);
    expect(code).toContain('React');
  });
});
```

### Cypress Setup

#### Installation
```bash
npm install --save-dev cypress
```

#### Test Example
```typescript
describe('DOM Agent E2E', () => {
  it('should complete inspection workflow', () => {
    cy.visit('https://example.com');

    // Open extension popup
    cy.get('#extension-icon').click();

    // Start inspection
    cy.get('#inspectBtn').click();

    // Verify inspection mode
    cy.get('.inspection-overlay').should('be.visible');

    // Interact with element
    cy.get('button').first().trigger('mouseover');
    cy.get('button').first().click();

    // Verify results
    cy.get('.generated-code').should('contain', 'React');
  });
});
```

---

## Performance Testing

### Memory Usage Testing

#### Chrome DevTools Memory Tab
1. Open DevTools → Memory tab
2. Take heap snapshot before extension actions
3. Perform extension operations
4. Take heap snapshot after
5. Compare memory usage

#### Automated Memory Testing
```typescript
describe('Memory Performance', () => {
  it('should not leak memory during repeated operations', async () => {
    const initialMemory = performance.memory.usedJSHeapSize;

    // Perform 100 operations
    for (let i = 0; i < 100; i++) {
      await domCapture.captureDOM();
    }

    const finalMemory = performance.memory.usedJSHeapSize;
    const memoryIncrease = finalMemory - initialMemory;

    // Allow 10MB increase for 100 operations
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
```

### Speed Performance Testing

#### Operation Timing
```typescript
describe('Speed Performance', () => {
  it('should capture DOM within acceptable time', async () => {
    const startTime = performance.now();

    await domCapture.captureDOM();

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete within 2 seconds
    expect(duration).toBeLessThan(2000);
  });

  it('should generate code quickly', async () => {
    const element = createMockElement('button');

    const startTime = performance.now();
    await codeGenerator.generateCode(element, 'react');
    const endTime = performance.now();

    // Should complete within 500ms
    expect(endTime - startTime).toBeLessThan(500);
  });
});
```

### Chrome Performance Tab

1. **Open DevTools → Performance tab**
2. **Start recording**
3. **Perform extension operations**
4. **Stop recording**
5. **Analyze:**
   - CPU usage during operations
   - Memory allocation patterns
   - Network requests
   - Main thread blocking

---

## Security Testing

### Input Validation Testing

#### XSS Prevention
```typescript
describe('XSS Prevention', () => {
  it('should sanitize malicious HTML', () => {
    const maliciousInput = '<script>alert("xss")</script><img src=x onerror=alert(1)>';

    const sanitized = ValidationUtils.sanitizeInput(maliciousInput);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('onerror');
  });

  it('should prevent code injection in prompts', () => {
    const maliciousPrompt = 'Generate code: <script>malicious</script>';

    const result = promptBuilder.buildPrompt(maliciousPrompt);

    expect(result).not.toContain('<script>');
    expect(result).not.toContain('malicious');
  });
});
```

### API Security Testing

#### Key Management
```typescript
describe('API Key Security', () => {
  it('should encrypt API keys in storage', async () => {
    const testKey = 'sk-test-api-key';
    await secureStorage.storeAPIKey(testKey);

    // Verify encryption
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        claudeApiKey: expect.any(String)
      })
    );

    // Verify it's not stored in plain text
    const call = chrome.storage.local.set.mock.calls[0][0];
    expect(call.claudeApiKey).not.toBe(testKey);
  });

  it('should handle invalid API keys gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Invalid API key'));

    await expect(claudeService.makeRequest('test')).rejects.toThrow('Invalid API key');
  });
});
```

### Content Security Policy Testing

#### CSP Validation
```typescript
describe('Content Security Policy', () => {
  it('should adhere to CSP restrictions', () => {
    // Test that extension doesn't use eval
    const code = fs.readFileSync('dist/background.js', 'utf8');
    expect(code).not.toContain('eval(');
    expect(code).not.toContain('Function(');

    // Test that inline scripts are avoided
    const html = fs.readFileSync('dist/popup.html', 'utf8');
    expect(html).not.toMatch(/<script[^>]*>[^<]*<\/script>/);
  });
});
```

---

## Debugging

### Chrome DevTools

#### Console Debugging
```javascript
// Enable debug logging
localStorage.setItem('dom-agent-debug', 'true');
location.reload();

// Disable debug logging
localStorage.removeItem('dom-agent-debug');
location.reload();

// Available debug commands
window.domAgent = {
  testAPI: () => console.log('Testing API connection...'),
  clearCache: () => chrome.storage.local.clear(),
  getSettings: () => chrome.storage.sync.get(),
  enableVerbose: () => localStorage.setItem('dom-agent-verbose', 'true'),
  disableVerbose: () => localStorage.removeItem('dom-agent-verbose')
};
```

#### Background Page Debugging
1. **Open background page:**
   - `chrome://extensions/`
   - Find DOM Agent → "background page"
   - Or: Right-click extension icon → "Inspect popup" → Console

2. **Debug message passing:**
   ```javascript
   // Monitor all messages
   chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
     console.log('Received message:', message, 'from:', sender);
     return true;
   });
   ```

#### Content Script Debugging
1. **Open webpage**
2. **Open DevTools**
3. **Check Console** for content script logs
4. **Sources tab** to debug content script

### Extension-Specific Debugging

#### Message Flow Debugging
```typescript
// Debug message flow
const originalSendMessage = chrome.runtime.sendMessage;
chrome.runtime.sendMessage = function(message, callback) {
  console.log('Sending message:', message);
  return originalSendMessage.call(this, message, (response) => {
    console.log('Received response:', response);
    if (callback) callback(response);
  });
};
```

#### DOM Event Debugging
```typescript
// Debug DOM events
document.addEventListener('click', (event) => {
  console.log('Click event:', {
    target: event.target,
    currentTarget: event.currentTarget,
    path: event.path,
    domAgent: event.target.closest('[data-dom-agent]')
  });
}, true);
```

### Network Debugging

#### API Request Monitoring
```typescript
// Monitor API requests
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  console.log('API Request:', url, options);
  return originalFetch.call(this, url, options)
    .then(response => {
      console.log('API Response:', response.status, response.url);
      return response;
    })
    .catch(error => {
      console.error('API Error:', error);
      throw error;
    });
};
```

---

## Continuous Integration

### GitHub Actions Setup

#### CI Workflow
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Lint code
      run: npm run lint

    - name: Type check
      run: npm run type-check

    - name: Run tests
      run: npm test -- --coverage

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

### Pre-commit Hooks

#### Husky Setup
```bash
npm install --save-dev husky lint-staged
npx husky install
```

#### Pre-commit Configuration
```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{ts,tsx,js,jsx}": [
      "jest --findRelatedTests --passWithNoTests"
    ]
  }
}
```

#### Husky Hooks
```bash
# .husky/pre-commit
npm run lint-staged

# .husky/pre-push
npm run test
npm run build
```

---

## Best Practices

### Test Organization

#### File Structure
```
src/
├── components/
│   ├── Component.test.tsx
│   ├── Component.spec.tsx
│   └── __tests__/
│       └── Component.integration.test.tsx
├── utils/
│   ├── util.test.ts
│   └── __mocks__/
│       └── api.ts
├── background/
│   ├── background.test.ts
│   └── message-handler.test.ts
└── content/
    ├── content.test.ts
    └── dom-capture.test.ts
```

#### Naming Conventions
```typescript
// Unit tests
component.test.ts
util.test.ts

// Integration tests
component.integration.test.ts
workflow.integration.test.ts

// E2E tests
user-workflow.e2e.test.ts
extension-loading.e2e.test.ts
```

### Mocking Strategies

#### Chrome API Mocking
```typescript
// __mocks__/chrome.ts
export const chrome = {
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    }
  }
};
```

#### API Mocking
```typescript
// Mock API responses
jest.mock('../api/claude', () => ({
  ClaudeAPI: {
    generateCode: jest.fn().mockResolvedValue({
      code: '<button>Click me</button>',
      language: 'typescript'
    })
  }
}));
```

### Test Data Management

#### Test Fixtures
```typescript
// fixtures/element.ts
export const mockButtonElement = {
  tagName: 'BUTTON',
  id: 'submit-btn',
  className: 'btn btn-primary',
  textContent: 'Submit',
  attributes: {
    type: 'submit',
    disabled: false
  }
};

export const mockFormElement = {
  tagName: 'FORM',
  id: 'contact-form',
  className: 'contact-form',
  children: [mockButtonElement]
};
```

#### Test Helpers
```typescript
// test-helpers/dom.ts
export function createMockElement(overrides = {}) {
  return {
    tagName: 'DIV',
    id: '',
    className: '',
    textContent: '',
    getAttribute: jest.fn(),
    getBoundingClientRect: jest.fn(() => ({
      x: 0, y: 0, width: 100, height: 100
    })),
    ...overrides
  };
}

export function createMockDocument(elements = []) {
  return {
    querySelector: jest.fn((selector) => elements[0] || null),
    querySelectorAll: jest.fn(() => elements),
    body: createMockElement({ tagName: 'BODY' }),
    ...elements
  };
}
```

---

## Troubleshooting

### Common Test Issues

#### Chrome API Not Available
```typescript
// Error: chrome is not defined
// Solution: Import chrome types and mock properly
import 'jest-environment-jsdom';
import chrome from 'sinon-chrome';

// Make chrome available globally
global.chrome = chrome;
```

#### Async Test Timeouts
```typescript
// Error: Timeout - Async callback was not invoked
// Solution: Increase timeout or fix async handling
it('should handle async operation', async () => {
  jest.setTimeout(10000); // Increase timeout

  const result = await asyncOperation();
  expect(result).toBeDefined();
});
```

#### Memory Leaks in Tests
```typescript
// Issue: Tests consuming too much memory
// Solution: Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();

  // Clean up DOM elements
  document.body.innerHTML = '';

  // Clean up event listeners
  if (window.removeEventListener) {
    // Remove any global event listeners
  }
});
```

### Debugging Test Failures

#### Verbose Test Output
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific failing test
npm test -- -t "should handle error case"

# Debug with node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

#### Test Isolation Issues
```typescript
// Problem: Tests affecting each other
// Solution: Ensure proper cleanup
describe('Component Tests', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('should render correctly', () => {
    // Test implementation
  });
});
```

### Performance Issues

#### Slow Test Suite
```typescript
// Optimize test performance
describe('Performance Tests', () => {
  // Use beforeAll instead of beforeEach when possible
  let setupData: any;

  beforeAll(async () => {
    setupData = await expensiveSetup();
  });

  it('should perform fast', () => {
    const start = performance.now();
    // Test operation
    const end = performance.now();

    expect(end - start).toBeLessThan(100); // 100ms max
  });
});
```

---

## Summary

This testing guide provides comprehensive coverage for testing the DOM Agent Chrome Extension:

- **Manual Testing**: Step-by-step user workflow testing
- **Automated Testing**: Unit tests, integration tests, E2E tests
- **Performance Testing**: Memory usage, speed optimization
- **Security Testing**: Input validation, API security
- **Debugging**: Chrome DevTools, console commands
- **CI/CD**: GitHub Actions, pre-commit hooks
- **Best Practices**: Test organization, mocking strategies

Follow this guide to ensure your Chrome extension is thoroughly tested and reliable before deployment.

For questions or issues, refer to the main [README.md](README.md) or create an issue in the repository.
