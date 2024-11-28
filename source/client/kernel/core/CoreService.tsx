import { createRoot } from 'react-dom/client';
import { IApplicationListener } from 'mn-toolkit';
import { logger } from 'mn-tools';
import { Page } from '../page';

const log = logger('$core');

const HOME_STATE = 'home';

export class CoreService implements Partial<IApplicationListener> {
  public async setup() {
    app.addListener(this);

    app.$store.configure({
      storeName: app.conf.dbName!,
      storeVersion: 1,
      nonMobileStore: 'indexedDB',
      storePrefix: app.conf.objectStoreName,
    });

    if (app.$device.isElectron(window)) {
      window.electron.ipcRenderer.addListener('updateAvailable', (_info) =>
        app.$errorManager.handlePromise(window.electron!.ipcRenderer.invoke('downloadAppUpdate'))
      );

      window.electron.ipcRenderer.addListener(
        'updateDownloaded',
        (info) => !!info && app.$errorManager.handlePromise(app.$store.set('available-update', info))
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
  }
}
