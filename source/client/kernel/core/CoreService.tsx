import { createRoot } from "react-dom/client";
import { IApplicationListener } from "libraries/mn-toolkit";
import { Page } from "../page";

const HOME_STATE = 'home';

/**
 * Classe principale de l'application qui opère
 * l'initialisation de l'ensemble des composants.
 */
export class CoreService implements Partial<IApplicationListener> {

  /**
   * Configuration de l'application (appelé par toolkit/bootstrap).
   */
  public setup() {
    app.addListener(this);
  }

  public gotoHome() {
    app.$router.go(HOME_STATE);
  }

  public applicationReady() {
    // console.log('applicationReady');
    const body = createRoot(document.body);
    body.render(<Page />);
    this.gotoHome();
  }

}
