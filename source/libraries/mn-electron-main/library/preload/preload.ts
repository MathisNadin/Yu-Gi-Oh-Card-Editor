import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { getProjectIpcRenderer } from '../../../../client/electron-patchs/preload';

const defaultIpcRenderer: Partial<IIpcRenderer> = {
  addListener<C extends TIpcMainSendChannel>(channel: C, func: (...args: TIpcMainSendChannelArgs<C>) => void) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = (_event: IpcRendererEvent, ...args: any[]) => func(...(args as TIpcMainSendChannelArgs<C>));
    ipcRenderer.addListener(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },

  once<C extends TIpcMainSendChannel>(channel: C, func: (...args: TIpcMainSendChannelArgs<C>) => void) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ipcRenderer.once(channel, (_event, ...args: any[]) => func(...(args as TIpcMainSendChannelArgs<C>)));
  },

  send<C extends TIpcRendererSendChannel>(channel: C, args: TIpcRendererSendChannelArgs<C>) {
    ipcRenderer.send(channel, args);
  },

  async invoke<C extends TIpcRendererInvokeChannel>(
    channel: C,
    ...args: TIpcRendererInvokeChannelArgs<C>
  ): Promise<TIpcRendererInvokeChannelResponse<C>> {
    return await ipcRenderer.invoke(channel, ...args);
  },
};

const electronHandler: IElectronHandler = {
  ipcRenderer: { ...defaultIpcRenderer, ...getProjectIpcRenderer() } as IIpcRenderer,
};

contextBridge.exposeInMainWorld('electron', electronHandler);
