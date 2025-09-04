# DOM Agent User Guide

Welcome to DOM Agent! This comprehensive guide will walk you through everything you need to know to effectively use DOM Agent for DOM inspection and AI-powered code generation.

## 🎯 What is DOM Agent?

DOM Agent is a powerful VS Code extension that bridges the gap between web development and AI-assisted coding. It allows you to:

- **Capture and inspect** any webpage's DOM structure in real-time
- **Interact with elements** through a visual interface
- **Generate production-ready code** using AI assistance
- **Export element data** in multiple formats for testing and automation

## 🚀 Quick Start

### Installation

1. **Install from Marketplace:**
   - Open VS Code/Cursor
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "DOM Agent"
   - Click Install

2. **Alternative Installation:**
   ```bash
   code --install-extension dom-agent
   ```

### First Use

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. **Run command:** `DOM Agent: Open URL in DOM Agent`
3. **Enter a URL** (e.g., `https://github.com` or `localhost:3000`)
4. **Start inspecting!** Click on elements in the captured DOM

## 📖 Basic Usage

### Capturing Webpages

#### Method 1: URL Input
```
Command Palette → DOM Agent: Open URL in DOM Agent
```
- Enter any valid URL
- Supports both HTTP and HTTPS
- Works with local development servers

#### Method 2: Auto-detect Dev Servers
```
Command Palette → DOM Agent: Detect Local Dev Server
```
- Automatically scans common development ports (3000, 3001, 4200, 5173, 8000, etc.)
- Displays framework information when detected
- Select from multiple running servers

### Element Inspection

#### Selecting Elements
1. **Move your mouse** over elements in the captured DOM
2. **Elements highlight** with a blue outline as you hover
3. **Click an element** to select it permanently
4. **Selected elements** show a red outline

#### Element Information
When you select an element, DOM Agent displays:

- **Tag Name**: HTML element type (div, span, button, etc.)
- **Classes**: CSS class names
- **ID**: Element ID if present
- **Attributes**: All HTML attributes
- **CSS Selectors**: Multiple selector strategies
- **XPath**: Full XPath expression
- **Computed Styles**: Complete CSS styling information

### Code Generation

#### Generating Code
1. **Select an element** in the DOM view
2. **Run command:** `DOM Agent: Generate Code from Selection`
3. **Choose framework:** React, Vue, Angular, or vanilla JavaScript
4. **Copy generated code** to your clipboard

#### Supported Frameworks

**React Components:**
```tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary'
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      data-testid="button"
    >
      {children}
    </button>
  );
};
```

**Vue Components:**
```vue
<template>
  <button
    :class="['btn', `btn-${variant}`]"
    @click="handleClick"
    data-testid="button"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary'
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>
```

**Angular Components:**
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `
    <button
      [ngClass]="['btn', 'btn-' + variant]"
      (click)="onClick.emit()"
      data-testid="button"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-primary {
      background-color: #007acc;
      color: white;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Output() onClick = new EventEmitter<void>();
}
```

## ⚙️ Advanced Configuration

### Extension Settings

Access settings through:
```
File → Preferences → Settings → Extensions → DOM Agent
```

#### Browser Configuration
```json
{
  "domAgent.defaultBrowser": "chromium"
}
```
- `chromium` - Chrome/Chromium (recommended)
- `firefox` - Mozilla Firefox
- `webkit` - Safari WebKit

#### AI Provider Settings
```json
{
  "domAgent.aiProvider": "cursor-native"
}
```
- `cursor-native` - Cursor IDE built-in AI
- `openai` - OpenAI GPT models
- `anthropic` - Anthropic Claude models

#### Development Server Detection
```json
{
  "domAgent.autoDetectDevServer": true
}
```
- `true` - Automatically scan for dev servers
- `false` - Manual URL entry only

### Custom Keyboard Shortcuts

Add custom shortcuts in VS Code:
```
File → Preferences → Keyboard Shortcuts
```

Search for "DOM Agent" commands and assign your preferred key combinations.

## 🎨 Advanced Features

### Element Selector Strategies

DOM Agent generates multiple selector strategies for maximum reliability:

#### 1. ID Selectors (Most Stable)
```javascript
// Playwright
await page.locator('#submit-button').click();

// Cypress
cy.get('#submit-button').click();
```

#### 2. Test ID Selectors
```javascript
// Playwright
await page.getByTestId('submit-btn').click();

// Cypress
cy.get('[data-testid="submit-btn"]').click();
```

#### 3. Text-based Selectors
```javascript
// Playwright
await page.getByText('Submit').click();

// Cypress
cy.contains('Submit').click();
```

#### 4. CSS Class Selectors
```javascript
// Playwright
await page.locator('.btn-primary').click();

// Cypress
cy.get('.btn-primary').click();
```

#### 5. Attribute Selectors
```javascript
// Playwright
await page.locator('[aria-label="Submit form"]').click();

// Cypress
cy.get('[aria-label="Submit form"]').click();
```

### XPath Expressions

DOM Agent also generates XPath expressions for complex scenarios:

```javascript
// Absolute XPath
await page.locator('/html/body/div[1]/form/button').click();

// Relative XPath
await page.locator('//button[@type="submit"]').click();

// Advanced XPath with conditions
await page.locator('//button[contains(@class, "primary") and not(@disabled)]').click();
```

### Custom AI Prompts

For advanced users, you can customize AI prompts by modifying the extension settings:

```json
{
  "domAgent.customPrompts": {
    "react": "Generate a React functional component with TypeScript...",
    "vue": "Create a Vue 3 Composition API component...",
    "angular": "Build an Angular component with reactive forms..."
  }
}
```

## 🔧 Troubleshooting

### Common Issues

#### Extension Won't Load
- **Symptom**: Commands not appearing in Command Palette
- **Solution**:
  - Reload VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"
  - Check Node.js version (18+ required)
  - Verify VS Code version (1.73.0+ required)

#### DOM Capture Fails
- **Symptom**: "Failed to capture webpage" error
- **Solution**:
  - Verify URL is accessible
  - Check network connectivity
  - Ensure Playwright browsers are installed
  - Try different browser engine

#### AI Code Generation Not Working
- **Symptom**: Code generation returns empty or incorrect results
- **Solution**:
  - Verify Cursor AI is enabled and configured
  - Check API keys for alternative AI providers
  - Ensure internet connectivity
  - Try selecting a different element

#### Elements Not Highlighting
- **Symptom**: Mouse hover doesn't highlight elements
- **Solution**:
  - Refresh the DOM capture
  - Check browser console for JavaScript errors
  - Verify the webpage allows DOM manipulation
  - Try a different URL

### Debug Mode

Enable debug logging for troubleshooting:

```json
{
  "domAgent.debugMode": true
}
```

Check VS Code's output panel for detailed logs:
```
View → Output → DOM Agent
```

## 📊 Performance Tips

### Optimizing Capture Performance

1. **Use Specific URLs**: Instead of homepages, capture specific pages
2. **Limit DOM Depth**: Configure maximum capture depth for large sites
3. **Choose Appropriate Browser**: Chromium is fastest for most scenarios

### Memory Management

- DOM Agent automatically cleans up resources
- Close unused webview panels to free memory
- Restart VS Code if experiencing memory issues

### Network Optimization

- Use local development servers when possible
- Avoid capturing large, media-heavy pages
- Consider network throttling for realistic testing

## 🎯 Best Practices

### Element Selection
1. **Prefer Stable Selectors**: Use IDs and test IDs when available
2. **Avoid Layout-dependent Selectors**: Don't rely on CSS positioning
3. **Use Semantic HTML**: Better selectors for accessible elements

### Code Generation
1. **Review Generated Code**: Always inspect AI-generated code
2. **Add Error Handling**: Include proper error boundaries
3. **Follow Framework Conventions**: Adhere to your team's coding standards

### Testing Integration
1. **Use Generated Selectors**: Copy selectors directly to test files
2. **Maintain Test Data**: Keep test IDs consistent across development
3. **Automate Selector Updates**: Use DOM Agent for selector maintenance

## 🔄 Integration with Development Workflow

### Version Control
- **Commit Generated Code**: Include AI-generated components in version control
- **Document Selector Changes**: Track selector updates in changelog
- **Code Review**: Review generated code for security and best practices

### CI/CD Integration
```yaml
# Example GitHub Actions workflow
- name: Run DOM tests
  run: |
    npm install -g @playwright/test
    npx playwright install
    npx playwright test
```

### Team Collaboration
- **Shared Selectors**: Maintain a team selector library
- **Consistent Naming**: Use standardized test IDs and data attributes
- **Documentation**: Document testing strategies and selector conventions

## 📞 Getting Help

### Documentation
- [Configuration Guide](configuration.md)
- [API Reference](api-reference.md)
- [Troubleshooting](troubleshooting.md)

### Community Support
- **GitHub Issues**: [Report bugs](https://github.com/your-username/dom-agent/issues)
- **Discussions**: [Ask questions](https://github.com/your-username/dom-agent/discussions)
- **Discord**: [Join community](https://discord.gg/dom-agent)

### Professional Support
- **Email**: support@dom-agent.dev
- **Documentation**: [Full documentation](https://dom-agent.dev/docs)

## 🎉 Next Steps

Now that you're familiar with DOM Agent basics:

1. **Explore Advanced Features**: Try different AI providers and frameworks
2. **Customize Configuration**: Tailor DOM Agent to your workflow
3. **Contribute**: Help improve DOM Agent by reporting issues or contributing code
4. **Share Feedback**: Let us know how DOM Agent can better serve your needs

Happy DOM inspection and code generation! 🚀
