import { IOverlayListener } from ".";
import { Observable } from "../observable";

export class OverlayService extends Observable<IOverlayListener> {

  private _overlay!: HTMLElement;
  private allowClick = true;

  public constructor() {
    super();
  }

  public get overlay() {
    if (!this._overlay) {
      this._overlay = document.createElement('div');
      this._overlay.classList.add('mn-overlay');
      document.body.appendChild(this._overlay);
      this._overlay.addEventListener('click', () => this.doClick());
    }
    return this._overlay;
  }

  public get active() {
    return this.overlay.classList.contains('active');
  }

  private fireClick() {
    this.dispatch('overlayClick');
  }

  private doClick() {
    if (!this.allowClick) return;
    this.fireClick();
    this.hide();
  }

  public show(disableClick?: boolean) {
    if (disableClick) this.allowClick = false;
    this.overlay.classList.add('active');
  }

  public hide() {
    this.overlay.classList.remove('active');
    this.allowClick = true;
  }
}
