import { join } from 'path';
import { existsSync, readFileSync, writeFile } from 'fs';
import { app, BrowserWindow, shell, ipcMain, dialog, IpcMainInvokeEvent } from 'electron';
import { download } from 'electron-dl';

export function addIpcMainHandleChannel<C extends TIpcRendererInvokeChannel>(
  channel: C,
  listener: (
    event: IpcMainInvokeEvent,
    ...args: TIpcRendererInvokeChannelArgs<C>
  ) => Promise<TIpcRendererInvokeChannelResponse<C>> | TIpcRendererInvokeChannelResponse<C>
) {
  ipcMain.handle(channel, (event, ...args) => {
    // Vérification du type des arguments
    return listener(event, ...(args as TIpcRendererInvokeChannelArgs<C>));
  });
}

export function addIpcMainHandleOnceChannel<C extends TIpcRendererInvokeChannel>(
  channel: C,
  listener: (
    event: IpcMainInvokeEvent,
    ...args: TIpcRendererInvokeChannelArgs<C>
  ) => Promise<TIpcRendererInvokeChannelResponse<C>> | TIpcRendererInvokeChannelResponse<C>
) {
  ipcMain.handleOnce(channel, (event, ...args) => {
    // Vérification du type des arguments
    return listener(event, ...(args as TIpcRendererInvokeChannelArgs<C>));
  });
}

export function setupIpcMainHandleChannels() {
  addIpcMainHandleChannel('getAppVersion', async (_event: IpcMainInvokeEvent) => {
    return app.getVersion();
  });

  addIpcMainHandleChannel('checkFileExists', async (_event: IpcMainInvokeEvent, filePath: string) => {
    return existsSync(filePath);
  });

  addIpcMainHandleChannel(
    'getFilePath',
    async (_event: IpcMainInvokeEvent, defaultPath?: string, filters?: TFileFilter[]) => {
      const directoryPath = await dialog.showOpenDialog({
        properties: ['openFile'],
        defaultPath,
        filters,
      });
      if (!directoryPath || directoryPath.canceled || !directoryPath.filePaths?.length) return undefined;
      return directoryPath.filePaths[0];
    }
  );

  addIpcMainHandleChannel('getDirectoryPath', async (_event: IpcMainInvokeEvent, defaultPath?: string) => {
    const directoryPath = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      defaultPath,
    });
    if (!directoryPath || directoryPath.canceled || !directoryPath.filePaths?.length) return undefined;
    return directoryPath.filePaths[0];
  });

  addIpcMainHandleChannel('readFileUtf8', async (_event: IpcMainInvokeEvent, filters?: TFileFilter[]) => {
    const directoryPath = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters,
    });
    if (!directoryPath || directoryPath.canceled || !directoryPath.filePaths?.length) return undefined;
    return readFileSync(directoryPath.filePaths[0]!, 'utf-8');
  });

  addIpcMainHandleChannel(
    'writeJsonFile',
    async (_event: IpcMainInvokeEvent, defaultFileName: string, jsonData: string, filePath?: string) => {
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
    }
  );

  addIpcMainHandleChannel(
    'writePngFile',
    async (_event: IpcMainInvokeEvent, defaultFileName: string, base64: string, filePath?: string) => {
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
    }
  );

  addIpcMainHandleChannel('createImgFromPath', (_event: IpcMainInvokeEvent, filePath: string) => {
    const base64 = readFileSync(filePath).toString('base64');
    return `data:image/png;base64,${base64}`;
  });

  addIpcMainHandleChannel('openLink', async (_event: IpcMainInvokeEvent, link: string) => {
    await shell.openExternal(link);
  });

  addIpcMainHandleChannel(
    'download',
    async (_event: IpcMainInvokeEvent, directory: string, url: string, filename?: string) => {
      let win = BrowserWindow.getFocusedWindow();
      if (!win) {
        const allWindows = BrowserWindow.getAllWindows();
        if (allWindows?.length) win = allWindows[0]!;
      }
      if (!win) throw new Error('No window found');
      const file = await download(win, url, { directory, filename });
      return file.getSavePath();
    }
  );
}
