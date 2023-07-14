/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
/* eslint no-unused-vars: off */
import { contextBridge, FileFilter, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  'ipc-example' | 'check-file-exists' | 'create-img-from-path' |
  'render-current-card' | 'save-current-or-temp-to-local' |
  'delete-local-db' | 'import-cards' | 'import-data' | 'export-data' |
  'read-file-utf-8' | 'get-app-version';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },

    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },

    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },

    invoke(channel: Channels, ...args: unknown[]): Promise<unknown> {
      return ipcRenderer.invoke(channel, ...args);
    },

    getAppVersion(): Promise<string> {
      return ipcRenderer.invoke('get-app-version');
    },

    readFileUtf8(filters?: FileFilter[]): Promise<Buffer> {
      return ipcRenderer.invoke('read-file-utf-8');
    },

    getFilePath(): Promise<string> {
      return ipcRenderer.invoke('get-file-path');
    },

    getDirectoryPath(): Promise<string> {
      return ipcRenderer.invoke('get-directory-path');
    },

    checkFileExists(path: string): Promise<boolean> {
      return ipcRenderer.invoke('check-file-exists', path);
    },

    createImgFromPath(path: string): Promise<string> {
      return ipcRenderer.invoke('create-img-from-path', path);
    },

    writePngFile(defaultFileName: string, base64: string, filePath?: string): Promise<void> {
      return ipcRenderer.invoke('write-png-file', defaultFileName, base64, filePath);
    },

    writeJsonFile(defaultFileName: string, jsonData: string, filePath?: string): Promise<void> {
      return ipcRenderer.invoke('write-json-file', defaultFileName, jsonData, filePath);
    },

    renderCurrentCard(): Promise<void> {
      return app.$card.renderCurrentCard();
    },

    saveCurrentToLocal(): Promise<void> {
      return app.$card.saveCurrentToLocal();
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
