import { contextBridge, FileFilter, ipcRenderer, IpcRendererEvent } from 'electron';
import { getProjectIpcRenderer } from '../../../client/electron-patchs/preload';

const defaultIpcRenderer: Partial<IIpcRenderer> = {
  send(channel: TSendChannel, args: unknown[]) {
    ipcRenderer.send(channel, args);
  },

  on(channel: TOnChannel, func: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => func(...args);
    ipcRenderer.on(channel, subscription);

    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },

  once(channel: TOnceChannel, func: (...args: unknown[]) => void) {
    ipcRenderer.once(channel, (_event, ...args) => func(...args));
  },

  invoke(channel: TInvokeChannel, ...args: unknown[]): Promise<unknown> {
    return ipcRenderer.invoke(channel, ...args);
  },

  openLink(link: string) {
    return ipcRenderer.invoke('openLink', link);
  },

  download(directoryPath: string, url: string, filename?: string): Promise<string> {
    return ipcRenderer.invoke('download', directoryPath, url, filename);
  },

  getAppVersion(): Promise<string> {
    return ipcRenderer.invoke('getAppVersion');
  },

  readFileUtf8(filters?: FileFilter[]): Promise<Buffer> {
    return ipcRenderer.invoke('readFileUtf8', filters);
  },

  getFilePath(defaultPath?: string): Promise<string> {
    return ipcRenderer.invoke('getFilePath', defaultPath);
  },

  getDirectoryPath(defaultPath?: string): Promise<string> {
    return ipcRenderer.invoke('getDirectoryPath', defaultPath);
  },

  checkFileExists(path: string): Promise<boolean> {
    return ipcRenderer.invoke('checkFileExists', path);
  },

  createImgFromPath(path: string): Promise<string> {
    return ipcRenderer.invoke('createImgFromPath', path);
  },

  writePngFile(defaultFileName: string, base64: string, filePath?: string): Promise<void> {
    return ipcRenderer.invoke('writePngFile', defaultFileName, base64, filePath);
  },

  writeJsonFile(defaultFileName: string, jsonData: string, filePath?: string): Promise<void> {
    return ipcRenderer.invoke('writeJsonFile', defaultFileName, jsonData, filePath);
  },
};

const electronHandler: IElectronHandler = {
  ipcRenderer: { ...defaultIpcRenderer, ...getProjectIpcRenderer() } as IIpcRenderer,
};

contextBridge.exposeInMainWorld('electron', electronHandler);
