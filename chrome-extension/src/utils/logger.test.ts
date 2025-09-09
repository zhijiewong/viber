import { Logger, LogLevel } from './logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleDebugSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = Logger.getInstance();
    logger.setLogLevel(LogLevel.DEBUG); // Set to DEBUG to test debug-level methods
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleDebugSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const logger1 = Logger.getInstance();
      const logger2 = Logger.getInstance();
      expect(logger1).toBe(logger2);
    });
  });

  describe('Log Levels', () => {
    beforeEach(() => {
      logger.setLogLevel(LogLevel.DEBUG);
    });

    it('should log debug messages when level is DEBUG', () => {
      logger.debug('Debug message', { data: 'test' });
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] DOM Agent: Debug message')
      );
    });

    it('should log info messages when level is DEBUG', () => {
      logger.info('Info message', { data: 'test' });
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] DOM Agent: Info message')
      );
    });

    it('should not log debug when level is INFO', () => {
      logger.setLogLevel(LogLevel.INFO);
      logger.debug('Debug message');
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });

  describe('Error Logging', () => {
    it('should handle error objects', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] DOM Agent: Error occurred')
      );
    });

    it('should handle string errors', () => {
      logger.error('String error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('String error')
      );
    });
  });

  describe('Chrome Extension Integration', () => {
    beforeEach(() => {
      // Mock chrome.runtime.sendMessage
      (global as any).chrome.runtime.sendMessage = jest.fn();
    });

    it('should send error to background script in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Production error');
      logger.error('Production error', error);

      expect((global as any).chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'LOG_ERROR',
        payload: expect.objectContaining({
          message: 'Production error',
          error: expect.any(Error),
          timestamp: expect.any(String)
        })
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should not send error to background script in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Development error');
      logger.error('Development error', error);

      // Note: In development mode, we still log errors but don't send to background
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] DOM Agent: Development error')
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Extension-specific Methods', () => {
    it('should log extension actions', () => {
      logger.logExtensionAction('INSPECT_ELEMENT', { elementId: 'test' });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Extension action: INSPECT_ELEMENT')
      );
    });

    it('should log content script actions', () => {
      logger.logContentScriptAction('CAPTURE_DOM', { url: 'test.com' });

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('Content script action: CAPTURE_DOM')
      );
    });

    it('should log background actions', () => {
      logger.logBackgroundAction('MESSAGE_RECEIVED', { type: 'TEST' });

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('Background action: MESSAGE_RECEIVED')
      );
    });
  });
});
