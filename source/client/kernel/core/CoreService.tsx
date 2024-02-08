import { createRoot } from 'react-dom/client';
import { IApplicationListener } from 'libraries/mn-toolkit';
import { Page } from '../page';

const HOME_STATE = 'home';

/**
 * Classe principale de l'application qui opère
 * l'initialisation de l'ensemble des composants.
 */
export class CoreService implements Partial<IApplicationListener> {
  /**
   * Configuration de l'application (appelé par toolkit/bootstrap).
   */
  public async setup() {
    app.addListener(this);
    return Promise.resolve();
  }

  public gotoHome() {
    app.$router.go(HOME_STATE);
  }

  public applicationReady() {
    // console.log('applicationReady');
    const container = document.getElementById('root')!;
    const root = createRoot(container);
    root.render(<Page />);
    this.gotoHome();
  }
}
