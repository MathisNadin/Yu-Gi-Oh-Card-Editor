import { IOverlayListener } from '.';
import { AbstractObservable } from 'mn-tools';

export class OverlayService extends AbstractObservable<IOverlayListener> {
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

  private doClick() {
    if (!this.allowClick) return;
    this.dispatch('overlayClick');
    this.hide();
  }

  public show(options: { withMenuMargin?: boolean; disableClick?: boolean } = {}) {
    if (options.disableClick) this.allowClick = false;
    this.overlay.classList.add('active');
    if (options.withMenuMargin) this.overlay.classList.add('with-menu-margin');
  }

  public hide() {
    this.overlay.classList.remove('active');
    this.overlay.classList.remove('with-menu-margin');
    this.allowClick = true;
  }
}
