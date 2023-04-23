/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  'ipc-example' | 'check-file-exists' | 'create-img-from-path' |
  'render-current-card' | 'save-current-to-local' | 'delete-local-db';

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
    writePngFile(defaultFileName: string, base64: string): Promise<void> {
      return ipcRenderer.invoke('write-png-file', defaultFileName, base64);
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
