import { DeviceService } from './DeviceService';

export * from './DeviceService';

declare global {
  interface IApp {
    $device: DeviceService;
  }

  interface Document {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mozHidden: any;
  }

  interface ISendChannel {}
  type TSendChannel = keyof ISendChannel;

  interface IOnceChannel {}
  type TOnceChannel = keyof IOnceChannel;

  interface IOnChannel {
    deleteLocalDb?: null;
  }
  type TOnChannel = keyof IOnChannel;

  interface IInvokeChannel {
    getAppVersion?: null;
    checkFileExists?: null;
    getFilePath?: null;
    getDirectoryPath?: null;
    readFileUtf8?: null;
    writePngFile?: null;
    writeJsonFile?: null;
    createImgFromPath?: null;
    openLink?: null;
    download?: null;
  }
  type TInvokeChannel = keyof IInvokeChannel;

  interface FileFilter {
    // Docs: https://electronjs.org/docs/api/structures/file-filter
    extensions: string[];
    name: string;
  }
  type TFileFilter = FileFilter;

  interface IIpcRenderer {
    send: (channel: TSendChannel, args: unknown[]) => void;
    on: (channel: TOnChannel, func: (...args: unknown[]) => void) => () => void;
    once: (channel: TOnceChannel, func: (...args: unknown[]) => void) => void;
    invoke: (channel: TInvokeChannel, ...args: unknown[]) => Promise<unknown>;
    openLink: (link: string) => Promise<void>;
    download: (directoryPath: string, url: string, filename?: string) => Promise<string>;
    getAppVersion: () => Promise<string>;
    readFileUtf8: (filters?: TFileFilter[]) => Promise<string | Buffer>;
    getFilePath: (defaultPath?: string) => Promise<string>;
    getDirectoryPath: (defaultPath?: string) => Promise<string>;
    checkFileExists: (path: string) => Promise<boolean>;
    createImgFromPath: (path: string) => Promise<string>;
    writePngFile: (defaultFileName: string, base64: string, filePath?: string) => Promise<void>;
    writeJsonFile: (defaultFileName: string, jsonData: string, filePath?: string) => Promise<void>;
  }

  interface IElectronHandler {
    ipcRenderer: IIpcRenderer;
  }

  interface Window {
    electron: IElectronHandler;
  }
}
