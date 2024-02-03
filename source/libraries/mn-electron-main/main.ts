import path, { join } from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog, FileFilter } from 'electron';
import { existsSync, readFileSync, writeFile } from 'fs';
import MenuBuilder from './menu';
import { download } from 'electron-dl';

let mainWindow: BrowserWindow | null = null;

ipcMain.handle('open-link', async (_event, link: string) => {
  shell.openExternal(link);
});

ipcMain.handle('download', async (_event, directory: string, url: string) => {
  let win = BrowserWindow.getFocusedWindow() as BrowserWindow;
  if (!win) {
    let allWindows = BrowserWindow.getAllWindows();
    if (allWindows?.length) {
      win = allWindows[0];
    }
  }
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

ipcMain.handle('get-file-path', async (_event, defaultPath: string) => {
  const directoryPath = await dialog.showOpenDialog({
    properties: ['openFile'],
    defaultPath,
  });
  if (!directoryPath || directoryPath.canceled || !directoryPath.filePaths?.length) return undefined;
  return directoryPath.filePaths[0];
});

ipcMain.handle('get-directory-path', async (_event, defaultPath: string) => {
  const directoryPath = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    defaultPath,
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
    // eslint-disable-next-line consistent-return
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
    // eslint-disable-next-line consistent-return
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

const createWindow = async () => {
  const isDev = process.env.NODE_ENV === 'development';

  let preloadPath: string;
  if (isDev) {
    preloadPath = path.join(__dirname, '../../../.desktop-temp/preload.js');
  } else {
    preloadPath = path.join(__dirname, 'preload.js');
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    webPreferences: {
      preload: preloadPath,
    },
  });

  mainWindow.maximize();

  function resolveHtmlPath(htmlFileName: string) {
    if (isDev) {
      const port = process.env.PORT || 8080;
      const url = new URL(`http://localhost:${port}`);
      url.pathname = htmlFileName;
      return url.href;
    }
    return `file://${path.resolve(__dirname, htmlFileName)}`;
  }

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
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') app.quit();
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
    if (!BrowserWindow.getAllWindows().length) createWindow();
    });
  })
  .catch(console.log);
