import path from 'path';
import { createConnection } from 'net';
import { platform } from 'os';
import { BrowserWindow, shell, Menu, app } from 'electron';
import { buildDefaultDarwinTemplate, buildDefaultTemplate } from './defaultMenus';
import { buildProjectMenuDarwinTemplate, buildProjectMenuTemplate } from '../../../../client/electron-patchs/main';

export class WindowManager {
  private _browserWindow: BrowserWindow | null = null;
  public get browserWindow() {
    return this._browserWindow;
  }

  public async createWindow() {
    const isDev = process.env.NODE_ENV === 'development';

    // In prod, don't provide the icon, let electron-builder.json handle it
    let iconPath: string | undefined;
    let preloadPath: string;
    if (isDev) {
      const sourceFolderPath = path.join(__dirname, '..', '..', '..', '..');
      preloadPath = path.join(sourceFolderPath, '..', '.temp-desktop', 'preload.js');

      const iconsFolderPath = path.join(sourceFolderPath, 'assets', 'icons');
      if (platform() === 'win32') {
        iconPath = path.join(iconsFolderPath, 'icon.ico'); // Windows
      } else {
        iconPath = path.join(iconsFolderPath, 'icon.png'); // macOS & Linux
      }
    } else {
      preloadPath = path.join(__dirname, 'preload.js');
    }

    this._browserWindow = new BrowserWindow({
      show: false,
      width: 1024,
      height: 728,
      icon: iconPath,
      webPreferences: {
        preload: preloadPath,
      },
    });

    this._browserWindow.maximize();

    const url = await this.resolveHtmlPath('index.html');
    await this._browserWindow.loadURL(url);

    this._browserWindow.on('ready-to-show', () => {
      if (!this._browserWindow) {
        throw new Error('browserWindow is not defined');
      }
      if (process.env.START_MINIMIZED) {
        this._browserWindow.minimize();
      } else {
        this._browserWindow.show();
      }
    });

    this._browserWindow.on('closed', () => {
      this._browserWindow = null;
    });

    // Setup dev environment
    if (isDev || process.env.DEBUG_PROD === 'true') {
      this._browserWindow.webContents.on('context-menu', (_event, params) => {
        Menu.buildFromTemplate([
          {
            label: 'Inspect element',
            click: () => this._browserWindow!.webContents.inspectElement(params.x, params.y),
          },
        ]).popup({ window: this._browserWindow! });
      });
    }

    // Build menu
    let menuTemplate: Electron.MenuItemConstructorOptions[];
    if (process.platform === 'darwin') {
      menuTemplate = buildProjectMenuDarwinTemplate(this._browserWindow, app, shell);
      if (!menuTemplate?.length) menuTemplate = buildDefaultDarwinTemplate(this._browserWindow, app, shell);
    } else {
      menuTemplate = buildProjectMenuTemplate(this._browserWindow, app, shell);
      if (!menuTemplate?.length) menuTemplate = buildDefaultTemplate(this._browserWindow, app, shell);
    }
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    // Open urls in the user's browser
    this._browserWindow.webContents.setWindowOpenHandler((edata) => {
      shell.openExternal(edata.url).catch(console.error);
      return { action: 'deny' };
    });

    if (isDev) this._browserWindow.webContents.openDevTools();
  }

  private async resolveHtmlPath(htmlFileName: string) {
    return await new Promise<string>((resolve) => {
      if (process.env.NODE_ENV === 'development') {
        const port = process.env.PORT ? Number(process.env.PORT) : 8080;
        const url = `http://localhost:${port}/${htmlFileName}`;

        // Test the connection to the dev server
        const tryConnect = () => {
          const client = createConnection({ port }, () => {
            client.end();
            resolve(url);
          });

          client.on('error', () => {
            setTimeout(tryConnect, 1000); // Retry if connection fails
          });
        };

        tryConnect();
      } else {
        resolve(`file://${path.resolve(__dirname, htmlFileName)}`);
      }
    });
  }
}
