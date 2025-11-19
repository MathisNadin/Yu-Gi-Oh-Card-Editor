import axios, { AxiosRequestConfig } from 'axios';
import { extname } from 'path';
import { existsSync, statSync } from 'fs';
import { app, IpcMainInvokeEvent, nativeImage } from 'electron';
import { autoUpdater } from 'electron-updater';
import { normalizeError } from '../../libraries/mn-tools';
import { addIpcMainHandleChannel } from '../../libraries/mn-electron-main';

type TAxiosPostOptions = AxiosRequestConfig & {
  /** User-Agent à envoyer (écrase le header si déjà présent) */
  userAgent?: string;
};

export interface ITallCardOptions {
  /**
   * Minimal height/width ratio required to consider the image
   * clearly portrait-oriented (e.g. 1.3 = 30% taller than wide).
   */
  minPortraitRatio?: number;
}

export interface IImageSize {
  width: number;
  height: number;
}

declare global {
  interface IIpcMainSendChannel {
    renderCurrentCard: [];
    saveCurrentOrTempToLocal: [];
    importCards: [];
    importData: [];
    exportData: [];
  }

  interface IIpcRendererInvokeChannel {
    getImageSizeFromPath: { args: [imagePath: string]; response: IImageSize | undefined };
    axiosGet: { args: [url: string, options?: AxiosRequestConfig]; response: unknown };
    axiosPost: { args: [url: string, data: object, options?: TAxiosPostOptions]; response: unknown };
  }
}

// Ignore OS zoom as html-to-img does not handle it well
app.commandLine.appendSwitch('force-device-scale-factor', '1');

/**
 * Set of file extensions considered as image files.
 * This is a first-level filter before trying to decode the image.
 */
const SUPPORTED_IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

/**
 * Returns true if the provided path looks like an image file path
 * based on its extension.
 */
function isImageFilePath(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return SUPPORTED_IMAGE_EXTENSIONS.has(ext);
}

export function patchIpcMain(_ipcMain: TIpcMain) {
  addIpcMainHandleChannel('getImageSizeFromPath', async (_event: IpcMainInvokeEvent, imagePath: string) => {
    try {
      // Basic checks: file exists and is a regular file
      if (!existsSync(imagePath)) return undefined;

      const stat = statSync(imagePath);
      if (!stat.isFile()) return undefined;

      // Check extension is an image extension
      if (!isImageFilePath(imagePath)) return undefined;

      // Let Electron decode the image
      const img = nativeImage.createFromPath(imagePath);
      const { width, height } = img.getSize();

      // If Electron cannot decode it, size will be 0x0
      if (!width || !height) return undefined;

      return Promise.resolve({ width, height });
    } catch {
      // Any error (permissions, invalid file, etc.) is treated as "not an image"
      return Promise.resolve(undefined);
    }
  });

  addIpcMainHandleChannel('axiosGet', async (_event: IpcMainInvokeEvent, url: string, options?: AxiosRequestConfig) => {
    try {
      const response = await axios.get(url, options);
      return response?.data;
    } catch (error) {
      console.error('GET request error:', error);
      return undefined;
    }
  });

  addIpcMainHandleChannel(
    'axiosPost',
    async (_event: IpcMainInvokeEvent, url: string, data: object, options: TAxiosPostOptions = {}) => {
      const { userAgent, headers, ...rest } = options;

      // Fusion des headers avec Content-Type / Accept par défaut
      const mergedHeaders = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(headers ?? {}),
        ...(userAgent ? { 'User-Agent': userAgent } : {}),
      };

      try {
        const res = await axios.post(url, data, {
          ...rest,
          headers: mergedHeaders,
        });
        return res?.data;
      } catch (error) {
        console.error('POST request error:', error);
        return undefined;
      }
    }
  );
}

export function buildProjectMenuDarwinTemplate(
  mainWindow: IBrowserWindow,
  app: IElectronApp,
  shell: IElectronShell
): IMenuItemConstructorOptions[] {
  const includeDevTools = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

  const subMenuAbout: IDarwinMenuItemConstructorOptions = {
    label: 'Electron',
    submenu: [
      {
        label: 'About ElectronReact',
        selector: 'orderFrontStandardAboutPanel:',
      },
      { type: 'separator' },
      { label: 'Services', submenu: [] },
      { type: 'separator' },
      {
        label: 'Hide ElectronReact',
        accelerator: 'Command+H',
        selector: 'hide:',
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        selector: 'hideOtherApplications:',
      },
      { label: 'Show All', selector: 'unhideAllApplications:' },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => app.quit(),
      },
    ],
  };

  const subMenuEdit: IDarwinMenuItemConstructorOptions = {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
      {
        label: 'Select All',
        accelerator: 'Command+A',
        selector: 'selectAll:',
      },
    ],
  };

  const subMenuViewDev: IMenuItemConstructorOptions = {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'Command+R',
        click: () => mainWindow.webContents.reload(),
      },
      {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()),
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Command+I',
        click: () => mainWindow.webContents.toggleDevTools(),
      },
    ],
  };

  const subMenuViewProd: IMenuItemConstructorOptions = {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()),
      },
    ],
  };

  const subMenuWindow: IDarwinMenuItemConstructorOptions = {
    label: 'Window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:',
      },
      { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
      { type: 'separator' },
      { label: 'Bring All to Front', selector: 'arrangeInFront:' },
    ],
  };

  const subMenuHelp: IMenuItemConstructorOptions = {
    label: 'Help',
    submenu: [
      {
        label: 'Learn More',
        click: () => {
          shell.openExternal('https://electronjs.org').catch(console.error);
        },
      },
      {
        label: 'Documentation',
        click: () => {
          shell.openExternal('https://github.com/electron/electron/tree/main/docs#readme').catch(console.error);
        },
      },
      {
        label: 'Community Discussions',
        click: () => {
          shell.openExternal('https://www.electronjs.org/community').catch(console.error);
        },
      },
      {
        label: 'Search Issues',
        click: () => {
          shell.openExternal('https://github.com/electron/electron/issues').catch(console.error);
        },
      },
    ],
  };

  const subMenuView = includeDevTools ? subMenuViewDev : subMenuViewProd;

  return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
}

export function buildProjectMenuTemplate(
  mainWindow: IBrowserWindow,
  _app: IElectronApp,
  shell: IElectronShell
): IMenuItemConstructorOptions[] {
  const includeDevTools = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

  const templateDefault: IMenuItemConstructorOptions[] = [
    {
      label: '&Fichier',
      submenu: [
        {
          label: '&Faire le rendu',
          accelerator: 'F1',
          click: () => mainWindow.webContents.send('renderCurrentCard'),
        },
        {
          label: '&Fermer',
          accelerator: 'Ctrl+W',
          click: () => mainWindow.close(),
        },
      ],
    },
    {
      label: '&Édition',
      submenu: [
        {
          label: '&Sauvegarder la carte',
          accelerator: 'F2',
          click: () => mainWindow.webContents.send('saveCurrentOrTempToLocal'),
        },
        {
          label: '&Importer depuis un site',
          accelerator: 'F3',
          click: () => mainWindow.webContents.send('importCards'),
        },
        {
          label: '&Importer des données',
          accelerator: 'F7',
          click: () => mainWindow.webContents.send('importData'),
        },
        {
          label: '&Exporter les données',
          accelerator: 'F8',
          click: () => mainWindow.webContents.send('exportData'),
        },
      ],
    },
    {
      label: '&Affichage',
      submenu: includeDevTools
        ? [
            {
              label: '&Recharger',
              accelerator: 'Ctrl+R',
              click: () => mainWindow.webContents.reload(),
            },
            {
              label: '&Plein écran',
              accelerator: 'F11',
              click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()),
            },
          ]
        : [
            {
              label: '&Plein écran',
              accelerator: 'F11',
              click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()),
            },
          ],
    },
    {
      label: '&Aide',
      submenu: [
        {
          label: 'Rechercher les mises à jour',
          click: () => {
            autoUpdater.checkForUpdates().catch((e) => console.error(e));
          },
        },
        {
          label: 'Documentation',
          click: () => {
            shell
              .openExternal('https://github.com/MathisNadin/Yu-Gi-Oh-Card-Editor')
              .catch((e) => console.error(`Failed to open URL: ${normalizeError(e).message}`));
          },
        },
      ],
    },
  ];

  if (includeDevTools) {
    templateDefault.push({
      label: '&Développement',
      submenu: [
        {
          label: '&Outils de développement',
          accelerator: 'Alt+Ctrl+I',
          click: () => mainWindow.webContents.toggleDevTools(),
        },
        {
          label: '&Supprimer les données locales',
          accelerator: 'Alt+Ctrl+D',
          click: () => mainWindow.webContents.send('deleteLocalDb'),
        },
      ],
    });
  }

  return templateDefault;
}
