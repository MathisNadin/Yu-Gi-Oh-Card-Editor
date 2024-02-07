import { IDrawerListener, IDrawer } from ".";
import { Observable } from "../observable";

export class DrawerService extends Observable<IDrawerListener> {
  private panes: IDrawer[] = [];

  public get active() {
    return !!this.panes.find(pane => pane.isActive);
  }

  public fireClose(pane: IDrawer) {
    this.dispatch('paneClose', pane);
  }

  protected fireOpen(pane: IDrawer) {
    this.dispatch('paneOpen', pane);
  }

  public registerPane(pane: IDrawer) {
    this.panes.push(pane);
  }

  public unregisterPane(pane: IDrawer) {
    this.panes.splice(this.panes.indexOf(pane), 1);
  }

  public close() {
    this.panes.forEach(pane => pane.retract());
  }

}
