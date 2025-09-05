// Mock VS Code API
const vscode = {
  window: {
    showInformationMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showInputBox: jest.fn(),
    showQuickPick: jest.fn(),
    withProgress: jest.fn(),
    createOutputChannel: jest.fn(() => ({
      appendLine: jest.fn(),
      show: jest.fn(),
      dispose: jest.fn(),
    })),
  },
  commands: {
    registerCommand: jest.fn(),
    executeCommand: jest.fn(),
    getCommands: jest.fn(() => Promise.resolve([])),
  },
  ExtensionContext: jest.fn(),
  Uri: {
    joinPath: jest.fn(),
    parse: jest.fn(),
  },
  ViewColumn: {
    One: 1,
  },
  ProgressLocation: {
    Notification: 1,
  },
  env: {
    clipboard: {
      writeText: jest.fn(() => Promise.resolve()),
    },
  },
};

module.exports = vscode;
