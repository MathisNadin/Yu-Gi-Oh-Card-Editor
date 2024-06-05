import { createRoot } from 'react-dom/client';
import { IApplicationListener } from 'mn-toolkit';
import { Page } from '../page';
import { logger } from 'mn-tools';

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
