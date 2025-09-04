import * as vscode from 'vscode';
import { WebviewProvider } from '../webview/WebviewProvider';
import { Logger } from '../utils/logger';
import * as net from 'net';

const logger = Logger.getInstance();

const COMMON_DEV_PORTS = [3000, 3001, 4200, 5000, 5173, 8000, 8080, 8100, 9000];

interface DevServer {
  url: string;
  port: number;
  framework?: string | undefined;
}

export async function detectDevServerCommand(webviewProvider: WebviewProvider): Promise<void> {
  try {
    logger.info('Detecting local development servers...');

    const detectedServers = await detectLocalServers();

    if (detectedServers.length === 0) {
      void vscode.window.showInformationMessage(
        'No local development servers detected. Try starting your dev server first.'
      );
      return;
    }

    let selectedServer: DevServer;

    if (detectedServers.length === 1) {
      selectedServer = detectedServers[0];
    } else {
      // Multiple servers found, let user choose
      const items = detectedServers.map(server => ({
        label: server.url,
        description: server.framework ?? 'Unknown framework',
        detail: `Port ${server.port}`,
        server,
      }));

      const selection = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a development server to inspect',
      });

      if (!selection) {
        return;
      }

      selectedServer = selection.server;
    }

    logger.info('Selected development server', selectedServer);

    // Capture the selected server
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'DOM Agent',
        cancellable: false,
      },
      async progress => {
        progress.report({ message: `Capturing ${selectedServer.url}...` });

        try {
          await webviewProvider.captureAndShowWebpage(selectedServer.url);
          progress.report({ message: 'Development server captured!' });
        } catch (error) {
          logger.error('Failed to capture dev server', error);
          throw error;
        }
      }
    );
  } catch (error) {
    logger.error('Error in detectDevServer command', error);
    void vscode.window.showErrorMessage(
      `Failed to detect dev server: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

async function detectLocalServers(): Promise<DevServer[]> {
  const servers: DevServer[] = [];
  const promises = COMMON_DEV_PORTS.map(port => checkPort(port));
  const results = await Promise.allSettled(promises);

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      const port = COMMON_DEV_PORTS[index];
      servers.push({
        url: `http://localhost:${port}`,
        port,
        framework: guessFramework(port),
      });
    }
  });

  return servers;
}

function checkPort(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const socket = new net.Socket();

    socket.setTimeout(1000);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('error', () => {
      resolve(false);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, 'localhost');
  });
}

function guessFramework(port: number): string | undefined {
  const frameworkMap: Record<number, string> = {
    3000: 'React/Next.js',
    4200: 'Angular',
    5173: 'Vite',
    8000: 'Django/Python',
    8080: 'Webpack Dev Server',
    8100: 'Ionic',
  };

  return frameworkMap[port];
}
