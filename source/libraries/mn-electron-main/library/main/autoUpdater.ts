import { BrowserWindow, IpcMainInvokeEvent } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';
import { addIpcMainHandleChannel } from './icpMainHandle';

declare global {
  type TElectronUpdateInfo = UpdateInfo;

  // Electron-updater may attach a 'code' property
  type TElectronUpdaterError = Error & { code?: string };

  interface IIpcMainSendChannel {
    updateAvailable: [info: TElectronUpdateInfo];
    updateDownloaded: [info: TElectronUpdateInfo];
    updateError: [error: TElectronUpdaterError];
  }

  interface IIpcRendererInvokeChannel {
    setAutoDownloadAppUpdate: { args: [value: boolean]; response: void };
    setAutoInstallOnAppQuit: { args: [value: boolean]; response: void };
    setAutoRunAppAfterInstall: { args: [value: boolean]; response: void };
    checkForAppUpdates: { args: []; response: void };
    downloadAppUpdate: { args: []; response: void };
    quitAndInstallAppUpdate: { args: []; response: void };
  }
}

// Utility function to send messages to all renderer processes
function sendToAllRenderers<C extends TIpcMainSendChannel>(channel: C, ...payload: TIpcMainSendChannelArgs<C>) {
  const windows = BrowserWindow.getAllWindows();
  for (const window of windows) {
    window.webContents.send(channel, ...payload);
  }
}

// Utility function to send update error
function sendUpdateError(error: TElectronUpdaterError) {
  sendToAllRenderers('updateError', error);
}

// Configure the autoUpdater events and IPC handlers
export function setupAutoUpdater() {
  // Default values
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.autoRunAppAfterInstall = true;

  // Event: Update available
  autoUpdater.addListener('update-available', (info: TElectronUpdateInfo) =>
    sendToAllRenderers('updateAvailable', info)
  );

  // Event: Update downloaded
  autoUpdater.addListener('update-downloaded', (info: TElectronUpdateInfo) =>
    sendToAllRenderers('updateDownloaded', info)
  );

  // Event: Update error
  autoUpdater.addListener('error', (error: Error) => sendUpdateError(error));

  // Handle setting autoDownload
  addIpcMainHandleChannel('setAutoDownloadAppUpdate', (_event: IpcMainInvokeEvent, value: boolean) => {
    autoUpdater.autoDownload = value;
  });

  // Handle setting autoInstallOnAppQuit
  addIpcMainHandleChannel('setAutoInstallOnAppQuit', (_event: IpcMainInvokeEvent, value: boolean) => {
    autoUpdater.autoInstallOnAppQuit = value;
  });

  // Handle setting autoRunAppAfterInstall
  addIpcMainHandleChannel('setAutoRunAppAfterInstall', (_event: IpcMainInvokeEvent, value: boolean) => {
    autoUpdater.autoRunAppAfterInstall = value;
  });

  // Handle checking for updates
  addIpcMainHandleChannel('checkForAppUpdates', async () => {
    try {
      await autoUpdater.checkForUpdates();
    } catch (error) {
      // Send error to renderer
      sendUpdateError(error as Error);
    }
  });

  // Handle downloading the update
  addIpcMainHandleChannel('downloadAppUpdate', async () => {
    try {
      await autoUpdater.downloadUpdate();
    } catch (error) {
      // Send error to renderer
      sendUpdateError(error as Error);
    }
  });

  // Handle quitting and installing
  addIpcMainHandleChannel('quitAndInstallAppUpdate', () => autoUpdater.quitAndInstall());
}
