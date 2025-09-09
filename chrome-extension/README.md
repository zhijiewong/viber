# DOM Agent - Chrome Extension

A powerful Chrome Extension for interactive DOM inspection and AI-powered code generation, providing client-side DOM analysis and code generation capabilities.

![DOM Agent Logo](resources/logo.png)

## Features

- **Interactive DOM Inspection**: Click any element on a webpage to inspect its properties
- **AI-Powered Code Generation**: Generate React, Vue, Angular, or vanilla JavaScript code from selected elements
- **Real-time Element Highlighting**: Visually highlight elements as you hover over them
- **CSS Selector & XPath Generation**: Automatically generate robust selectors for elements
- **DOM Snapshot Capture**: Capture complete DOM snapshots with styles and metadata
- **DevTools Integration**: Seamless integration with Chrome DevTools
- **Multiple Framework Support**: Generate code for popular JavaScript frameworks
- **Advanced Filtering**: Search and filter DOM elements efficiently

## Installation

### From Chrome Web Store

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore) (coming soon)
2. Search for "DOM Agent"
3. Click "Add to Chrome"
4. Confirm the installation

### Manual Installation (Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zhijiewong/dom-agent-chrome.git
   cd dom-agent-chrome
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension:**
   ```bash
   npm run build
   ```

4. **Load in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from the project

## Usage

### Basic DOM Inspection

1. **Open any webpage**
2. **Click the DOM Agent icon** in the Chrome toolbar
3. **Click "Inspect Element"** or use the keyboard shortcut (`Ctrl+Shift+I` on Windows/Linux, `Cmd+Shift+I` on Mac)
4. **Hover over elements** on the page to see them highlighted
5. **Click an element** to select it for inspection

### Code Generation

1. **Select an element** using the inspection tool
2. **Choose your framework** from the dropdown (React, Vue, Angular, Vanilla JS)
3. **Select code type** (Component, Test, Selector)
4. **Click "Generate Code"** to create the code
5. **Copy the generated code** to your clipboard

### DevTools Integration

1. **Open Chrome DevTools** (`F12` or `Ctrl+Shift+I`)
2. **Navigate to the "DOM Agent" panel**
3. **Use the enhanced inspection tools** with additional features
4. **View element properties** in the properties panel
5. **Generate code directly** from the DevTools interface

### Advanced Features

#### Context Menu Integration

- **Right-click any element** on a webpage
- **Select "DOM Agent"** from the context menu
- **Choose from available actions**:
  - Inspect Element
  - Capture DOM Snapshot
  - Generate Code
  - Open DevTools Panel

#### Keyboard Shortcuts

- `Ctrl+Shift+I` / `Cmd+Shift+I`: Start element inspection
- `Ctrl+Shift+G` / `Cmd+Shift+G`: Generate code for selected element
- `Escape`: Stop inspection mode

## Configuration

### Extension Settings

Access settings through the extension popup:

- **Auto-detect dev server**: Automatically detect running development servers
- **Advanced mode**: Enable advanced features and debugging options
- **Hover inspection**: Enable element highlighting on hover
- **Default framework**: Set your preferred framework for code generation

### Advanced Configuration

For advanced users, you can modify settings directly in Chrome storage:

```javascript
// Access via Chrome DevTools Console
chrome.storage.sync.get(null, (settings) => console.log(settings));

// Modify settings programmatically
chrome.storage.sync.set({
  autoDetectDevServer: true,
  advancedMode: false,
  hoverInspection: true,
  codeGenerationFramework: 'react'
});
```

## Development

### Project Structure

```
chrome-extension/
├── src/
│   ├── background/          # Background service worker
│   ├── content/            # Content scripts for web pages
│   ├── popup/              # Extension popup interface
│   ├── devtools/           # DevTools panel integration
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── components/         # Reusable UI components
├── public/                 # Static assets and manifest
├── dist/                   # Built extension (generated)
├── scripts/                # Build and development scripts
├── package.json
├── tsconfig.json
├── webpack.config.js
└── README.md
```

### Build Commands

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Build and package for distribution
npm run package

# Run tests
npm test

# Run linter
npm run lint

# Type checking
npm run type-check
```

### Development Workflow

1. **Make changes** to source files in `src/`
2. **Build the extension** using `npm run dev` for development
3. **Reload the extension** in `chrome://extensions/`
4. **Test your changes** on various websites
5. **Run tests** to ensure functionality works correctly

### Adding New Features

1. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement your feature** following the existing code patterns

3. **Add tests** for new functionality

4. **Update documentation** if needed

5. **Submit a pull request** with a clear description

## API Reference

### Content Script API

#### DOM Capture

```javascript
// Capture DOM snapshot
chrome.runtime.sendMessage({
  type: 'CAPTURE_DOM',
  payload: {
    fullPage: true,
    includeStyles: true
  }
});
```

#### Element Inspection

```javascript
// Start element inspection
chrome.runtime.sendMessage({
  type: 'START_INSPECTION'
});

// Stop inspection
chrome.runtime.sendMessage({
  type: 'STOP_INSPECTION'
});
```

#### Code Generation

```javascript
// Generate code for selected element
chrome.runtime.sendMessage({
  type: 'GENERATE_CODE',
  payload: {
    framework: 'react',
    type: 'component'
  }
});
```

### Background Script API

#### Settings Management

```javascript
// Get settings
const settings = await chrome.storage.sync.get(['autoDetectDevServer', 'advancedMode']);

// Update settings
await chrome.storage.sync.set({
  autoDetectDevServer: true,
  advancedMode: false
});
```

## Troubleshooting

### Common Issues

#### Extension not loading
- Ensure you've built the extension using `npm run build`
- Check that the `dist` folder exists and contains the built files
- Verify the manifest.json file is valid

#### Content script not working
- Check the browser console for errors
- Ensure the website allows content scripts (some sites have CSP restrictions)
- Verify the content script permissions in manifest.json

#### DevTools panel not appearing
- Refresh the DevTools window after loading the extension
- Check that DevTools integration is enabled
- Look for errors in the DevTools console

#### Code generation failing
- Ensure an element is selected before generating code
- Check that the selected framework is supported
- Verify network connectivity for AI-powered features

### Debug Mode

Enable debug logging:

```javascript
// In Chrome DevTools Console
localStorage.setItem('dom-agent-debug', 'true');

// Reload the extension to apply changes
```

### Reset Extension

To reset the extension to default settings:

1. Go to `chrome://extensions/`
2. Find DOM Agent and click "Details"
3. Scroll down and click "Reset settings"

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Code Style

- Use TypeScript for all new code
- Follow the existing code patterns and architecture
- Add JSDoc comments for public APIs
- Write comprehensive tests for new features

### Testing

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [Full Documentation](https://heviber.org/docs)
- **Issues**: [GitHub Issues](https://github.com/zhijiewong/dom-agent-chrome/issues)
- **Discussions**: [GitHub Discussions](https://github.com/zhijiewong/dom-agent-chrome/discussions)
- **Email**: support@heviber.org

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

## Acknowledgments

- Built with modern web technologies
- Inspired by browser developer tools
- Powered by AI for intelligent code generation

---

**Made with ❤️ by the DOM Agent team**
