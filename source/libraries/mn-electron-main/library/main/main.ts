// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../mn-toolkit/@types/electron.d.ts" />

import { app, BrowserWindow, ipcMain } from 'electron';
import { patchIpcMain } from '../../../../client/electron-patchs/main';
import { setupIpcMainHandleChannels } from './icpMainHandle';
import { setupAutoUpdater } from './autoUpdater';
import { WindowManager } from './WindowManager';

declare global {
  type TIpcMain = Electron.IpcMain;
}

// Setup IpcMain and Updater
setupIpcMainHandleChannels();
setupAutoUpdater();
patchIpcMain(ipcMain);

export const mainWindowManager = new WindowManager();

/**
 * Add event listeners
 */
app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (!BrowserWindow.getAllWindows().length) {
    mainWindowManager.createWindow().catch((e) => console.error(e));
  }
});

app
  .whenReady()
  .then(() => mainWindowManager.createWindow().catch((e) => console.error(e)))
  .catch(console.error);
