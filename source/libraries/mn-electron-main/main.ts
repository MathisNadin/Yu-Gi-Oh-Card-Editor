import path, { join } from 'path';
import { createConnection } from 'net';
import { existsSync, readFileSync, writeFile } from 'fs';
import { app, BrowserWindow, shell, ipcMain, dialog, FileFilter, Menu } from 'electron';
import { download } from 'electron-dl';
import { autoUpdater } from 'electron-updater';
import { buildDefaultDarwinTemplate, buildDefaultTemplate } from './menuTemplate';
import {
  buildProjectMenuDarwinTemplate,
  buildProjectMenuTemplate,
  patchIpcMain,
} from '../../client/electron-patchs/main';

declare global {
  type IIpcMain = Electron.IpcMain;
}

/**
 * Add event handlers
 */
ipcMain.handle('getAppVersion', async (_event) => {
  return app.getVersion();
});

ipcMain.handle('checkFileExists', async (_event, filePath: string) => {
  return existsSync(filePath);
});

ipcMain.handle('getFilePath', async (_event, defaultPath: string) => {
  const directoryPath = await dialog.showOpenDialog({
    properties: ['openFile'],
    defaultPath,
  });
  if (!directoryPath || directoryPath.canceled || !directoryPath.filePaths?.length) return undefined;
  return directoryPath.filePaths[0];
});

ipcMain.handle('getDirectoryPath', async (_event, defaultPath: string) => {
  const directoryPath = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    defaultPath,
  });
  if (!directoryPath || directoryPath.canceled || !directoryPath.filePaths?.length) return undefined;
  return directoryPath.filePaths[0];
});

ipcMain.handle('readFileUtf8', async (_event, filters: FileFilter[]) => {
  const directoryPath = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters,
  });
  if (!directoryPath || directoryPath.canceled || !directoryPath.filePaths?.length) return undefined;
  return readFileSync(directoryPath.filePaths[0], 'utf-8');
});

ipcMain.handle('writeJsonFile', async (_event, defaultFileName: string, jsonData: string, filePath?: string) => {
  let canceled = false;
  if (!filePath) {
    const result = await dialog.showSaveDialog({
      defaultPath: `${defaultFileName}.json`,
      filters: [{ extensions: ['json'], name: 'JSON File' }],
    });
    filePath = result?.filePath;
    canceled = result?.canceled;
  } else {
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

ipcMain.handle('writePngFile', async (_event, defaultFileName: string, base64: string, filePath?: string) => {
  let canceled = false;
  if (!filePath) {
    const result = await dialog.showSaveDialog({
      defaultPath: `${defaultFileName}.png`,
      filters: [{ extensions: ['png'], name: 'PNG Image' }],
    });
    filePath = result?.filePath;
    canceled = result?.canceled;
  } else {
    filePath = join(filePath, `${defaultFileName}.png`);
  }

  if (!canceled && filePath) {
    const finalFilePath = filePath.endsWith('.png') ? filePath : `${filePath}.png`;
    const buffer = Buffer.from(base64, 'base64');
    const uint8Array = new Uint8Array(buffer); // Convertir le buffer en Uint8Array

    // eslint-disable-next-line consistent-return
    writeFile(finalFilePath, uint8Array, (err) => {
      if (!err) return finalFilePath;
    });
  }
  return undefined;
});

ipcMain.handle('createImgFromPath', async (_event, filePath: string) => {
  const base64 = readFileSync(filePath).toString('base64');
  return `data:image/png;base64,${base64}`;
});

ipcMain.handle('openLink', async (_event, link: string) => {
  shell.openExternal(link);
});

ipcMain.handle('download', async (_event, directory: string, url: string, filename?: string) => {
  let win = BrowserWindow.getFocusedWindow() as BrowserWindow;
  if (!win) {
    let allWindows = BrowserWindow.getAllWindows();
    if (allWindows?.length) {
      win = allWindows[0];
    }
  }
  const file = await download(win, url, { directory, filename });
  return file.getSavePath();
});

patchIpcMain(ipcMain);

function checkForUpdates() {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('Mises à jour désactivées en mode développement.');
    return;
  }

  autoUpdater.fullChangelog = true; // Récupère les notes de version complètes pour chaque version

  // Vérifie les mises à jour et notifie si disponible
  autoUpdater.checkForUpdates();

  // Gère les événements de mises à jour
  autoUpdater.on('update-available', (info) => {
    const allReleaseNotes = info.releaseNotes;
    const currentVersion = app.getVersion();
    const latestVersion = info.version;

    // Accumuler les notes de version pour toutes les versions disponibles
    let notes: string;
    if (!allReleaseNotes) notes = 'Notes de version non disponibles.';
    else if (typeof allReleaseNotes === 'string') notes = allReleaseNotes;
    else notes = allReleaseNotes.map((release) => `Version ${release.version} :\n${release.note}`).join('\n\n');

    // Afficher une boîte de dialogue avec les notes de version et une option pour télécharger la mise à jour
    dialog
      .showMessageBox({
        type: 'info',
        title: `Mise à jour disponible : ${latestVersion}`,
        message: `Votre version actuelle est ${currentVersion}. Voici les changements apportés :`,
        detail: notes.replace(/<\/?[^>]+(>|$)/g, ''),
        buttons: ['Installer maintenant', 'Plus tard'],
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate(); // Télécharge la mise à jour si l'utilisateur choisit de l'installer
        }
      });
  });

  // Une fois la mise à jour téléchargée, propose de redémarrer pour installer la mise à jour
  autoUpdater.on('update-downloaded', () => {
    dialog
      .showMessageBox({
        title: 'Mise à jour prête',
        message: "Une nouvelle version a été téléchargée. Redémarrer maintenant pour l'installer.",
        buttons: ['Redémarrer', 'Plus tard'],
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall(); // Redémarre l'application et installe la mise à jour
        }
      });
  });
}

/**
 * Create main window
 */
const createWindow = async () => {
  const isDev = process.env.NODE_ENV === 'development';

  let preloadPath: string;
  if (isDev) {
    preloadPath = path.join(__dirname, '../../../.temp-desktop/preload.js');
  } else {
    preloadPath = path.join(__dirname, 'preload.js');
  }

  let mainWindow: BrowserWindow | null = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    webPreferences: {
      preload: preloadPath,
    },
  });

  mainWindow.maximize();

  function resolveHtmlPath(htmlFileName: string) {
    return new Promise<string>((resolve) => {
      if (isDev) {
        const port = process.env.PORT ? Number(process.env.PORT) : 8080;
        const url = `http://localhost:${port}/${htmlFileName}`;

        // Fonction pour tester la connexion au serveur de développement
        const tryConnect = () => {
          const client = createConnection({ port }, () => {
            client.end();
            resolve(url);
          });

          client.on('error', () => {
            setTimeout(tryConnect, 1000); // Réessayer après un délai si la connexion échoue
          });
        };

        tryConnect();
      } else {
        resolve(`file://${path.resolve(__dirname, htmlFileName)}`);
      }
    });
  }

  const url = await resolveHtmlPath('index.html');
  mainWindow.loadURL(url);

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }

    // Appeler la fonction de vérification des mises à jour ici
    checkForUpdates();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  function setupDevelopmentEnvironment(mainWindow: BrowserWindow): void {
    mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: mainWindow });
    });
  }

  if (isDev || process.env.DEBUG_PROD === 'true') {
    setupDevelopmentEnvironment(mainWindow as BrowserWindow);
  }

  let menuTemplate: IMenuItemConstructorOptions[];
  if (process.platform === 'darwin') {
    menuTemplate = buildProjectMenuDarwinTemplate(mainWindow, app, shell);
    if (!menuTemplate?.length) menuTemplate = buildDefaultDarwinTemplate(mainWindow, app, shell);
  } else {
    menuTemplate = buildProjectMenuTemplate(mainWindow, app, shell);
    if (!menuTemplate?.length) menuTemplate = buildDefaultTemplate(mainWindow, app, shell);
  }

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  if (isDev) mainWindow.webContents.openDevTools();
};

/**
 * Add event listeners
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
  .catch(console.error);
