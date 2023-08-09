/* eslint-disable import/order */
/* eslint-disable prefer-const */
/* eslint-disable consistent-return */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path, { join } from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog, FileFilter } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { existsSync, readFileSync, writeFile } from 'fs';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { download } from 'electron-dl';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, _arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.handle('download', async (_event, directory: string, url: string) => {
  const win = BrowserWindow.getFocusedWindow() as BrowserWindow;
  let file = await download(win, url, { directory });
  return file.getSavePath();
});

ipcMain.handle('get-app-version', async (_event) => {
  return app.getVersion();
});

ipcMain.handle('read-file-utf-8', async (_event, filters: FileFilter[]) => {
  const directoryPath = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters
  });
  if (!directoryPath || directoryPath.canceled || !directoryPath.filePaths?.length) return undefined;
  return readFileSync(directoryPath.filePaths[0], 'utf-8');
});

ipcMain.handle('get-file-path', async () => {
  const directoryPath = await dialog.showOpenDialog({
    properties: ['openFile'],
  });
  if (!directoryPath || directoryPath.canceled || !directoryPath.filePaths?.length) return undefined;
  return directoryPath.filePaths[0];
});

ipcMain.handle('get-directory-path', async () => {
  const directoryPath = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (!directoryPath || directoryPath.canceled || !directoryPath.filePaths?.length) return undefined;
  return directoryPath.filePaths[0];
});

ipcMain.handle('write-png-file', async (_event, defaultFileName: string, base64: string, filePath?: string) => {
  let canceled = false;
  if (!filePath) {
    const result = await dialog.showSaveDialog({
      defaultPath: `${defaultFileName}.png`,
      filters: [{ extensions: ['png'], name: 'PNG Image' }]
    });
    filePath = result?.filePath;
    canceled = result?.canceled;
  }
  else {
    filePath = join(filePath, `${defaultFileName}.png`);
  }

  if (!canceled && filePath) {
    const finalFilePath = filePath.endsWith('.png') ? filePath : `${filePath}.png`;
    const buffer = Buffer.from(base64, 'base64');
    writeFile(finalFilePath, buffer, (err) => {
      if (!err) return finalFilePath;
    });
  }
  return undefined;
});

ipcMain.handle('write-json-file', async (_event, defaultFileName: string, jsonData: string, filePath?: string) => {
  let canceled = false;
  if (!filePath) {
    const result = await dialog.showSaveDialog({
      defaultPath: `${defaultFileName}.json`,
      filters: [{ extensions: ['json'], name: 'JSON File' }]
    });
    filePath = result?.filePath;
    canceled = result?.canceled;
  }
  else {
    filePath = join(filePath, `${defaultFileName}.json`);
  }

  if (!canceled && filePath) {
    const finalFilePath = filePath.endsWith('.json') ? filePath : `${filePath}.json`;
    writeFile(finalFilePath, jsonData, (err) => {
      if (!err) return finalFilePath;
    });
  }
  return undefined;
});

ipcMain.handle('check-file-exists', async (_event, filePath: string) => {
  return existsSync(filePath);
});

ipcMain.handle('create-img-from-path', async (_event, filePath: string) => {
  const base64 = readFileSync(filePath).toString('base64');
  return `data:image/png;base64,${base64}`;
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('pictures', 'appIcon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.maximize();

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
