import { createRoot } from 'react-dom/client';
import { IApplicationListener } from 'mn-toolkit';
import { logger, Observable } from 'mn-tools';
import { Page } from '../page';
import { ICoreListener } from '.';

const log = logger('$core');

const HOME_STATE = 'home';

export class CoreService extends Observable<ICoreListener> implements Partial<IApplicationListener> {
  public async setup() {
    app.addListener(this);

    app.$store.configure({
      storeName: app.conf.dbName!,
      storeVersion: 1,
      nonMobileStore: 'indexedDB',
      storePrefix: app.conf.objectStoreName,
    });

    if (app.$device.isElectron(window)) {
      await window.electron.ipcRenderer.invoke('setAutoDownloadAppUpdate', true);
      await window.electron.ipcRenderer.invoke('setAutoInstallOnAppQuit', true);
      await window.electron.ipcRenderer.invoke('setAutoRunAppAfterInstall', true);

      window.electron.ipcRenderer.addListener(
        'updateDownloaded',
        (info) => !!info && this.dispatch('electronUpdateDownloaded', info)
      );

      window.electron.ipcRenderer.addListener('updateError', (error) => !!error && app.$errorManager.trigger(error));
    }

    return Promise.resolve();
  }

  public gotoHome() {
    app.$router.go(HOME_STATE);
  }

  public applicationReady() {
    log.debug('applicationReady');
    const container = document.getElementById('root')!;
    const root = createRoot(container);
    root.render(<Page />);
    this.gotoHome();

    if (app.$device.isElectron(window)) {
      app.$errorManager.handlePromise(window.electron.ipcRenderer.invoke('checkForAppUpdates'));
    }
  }
}
