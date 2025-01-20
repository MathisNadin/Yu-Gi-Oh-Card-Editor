declare global {
  interface FileFilter {
    // Docs: https://electronjs.org/docs/api/structures/file-filter
    extensions: string[];
    name: string;
  }
  type TFileFilter = FileFilter;

  interface IIpcMainSendChannel {
    deleteLocalDb: [];
  }
  type TIpcMainSendChannel = keyof IIpcMainSendChannel;
  type TIpcMainSendChannelArgs<C extends TIpcMainSendChannel> = IIpcMainSendChannel[C];

  interface IIpcRendererSendChannel {}
  type TIpcRendererSendChannel = keyof IIpcRendererSendChannel;
  type TIpcRendererSendChannelArgs<C extends TIpcRendererSendChannel> = IIpcRendererSendChannel[C];

  interface IIpcRendererInvokeChannel {
    getAppVersion: { args: []; response: string };
    checkFileExists: { args: [path: string]; response: boolean };
    getPathForFile: { args: [file: File]; response: string };
    getFilePath: { args: [defaultPath?: string]; response: string | undefined };
    getDirectoryPath: { args: [defaultPath?: string]; response: string | undefined };
    readFileUtf8: { args: [filters?: TFileFilter[]]; response: string | Buffer | undefined };
    writePngFile: { args: [defaultFileName: string, base64: string, filePath?: string]; response: void };
    writeJsonFile: { args: [defaultFileName: string, jsonData: string, filePath?: string]; response: void };
    createImgFromPath: { args: [path: string]; response: string | undefined };
    openLink: { args: [link: string]; response: void };
    download: { args: [directoryPath: string, url: string, filename?: string]; response: string | undefined };
  }
  type TIpcRendererInvokeChannel = keyof IIpcRendererInvokeChannel;
  type TIpcRendererInvokeChannelArgs<C extends TIpcRendererInvokeChannel> = IIpcRendererInvokeChannel[C]['args'];
  type TIpcRendererInvokeChannelResponse<C extends TIpcRendererInvokeChannel> =
    IIpcRendererInvokeChannel[C]['response'];

  interface IIpcRenderer {
    addListener<C extends TIpcMainSendChannel>(
      channel: C,
      func: (...args: TIpcMainSendChannelArgs<C>) => void
    ): () => void;
    once<C extends TIpcMainSendChannel>(channel: C, func: (...args: TIpcMainSendChannelArgs<C>) => void): void;
    send<C extends TIpcRendererSendChannel>(channel: C, args: TIpcRendererSendChannelArgs<C>): void;
    invoke<C extends TIpcRendererInvokeChannel>(
      channel: C,
      ...args: TIpcRendererInvokeChannelArgs<C>
    ): Promise<TIpcRendererInvokeChannelResponse<C>>;
    getPathForFile(file: File): string;
  }

  interface IElectronHandler {
    ipcRenderer: IIpcRenderer;
  }

  interface Window {
    electron?: IElectronHandler;
  }
}

export {};
