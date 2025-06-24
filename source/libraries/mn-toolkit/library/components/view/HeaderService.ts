import { AbstractObservable } from 'mn-tools';
import { IRouterListener } from '../../system';
import { IActionsPopoverAction } from '../popover';
import { IHeaderListener, IHeaderComponent as IHeaderPart } from '.';

export class HeaderService extends AbstractObservable<IHeaderListener> implements Partial<IRouterListener> {
  private _pageActions: IActionsPopoverAction[] = [];

  private _parts: { [position: string]: IHeaderPart[] } = {
    left: [],
    right: [],
    center: [],
  };

  public get pageActions(): IActionsPopoverAction[] {
    return this._pageActions;
  }

  public get parts() {
    return this._parts;
  }

  public constructor() {
    super();
    app.$router.addListener(this);
  }

  public async routerStateChanged() {
    await this.update();
  }

  public async update() {
    this._pageActions = [];
    this._parts = {
      left: [],
      center: [],
      right: [],
    };
    this.dispatch('headerGetPageActions', this._pageActions);

    const parts: IHeaderPart[] = [];
    this.dispatch('headerGetButtons', parts);

    parts.forEach((a, index) => (a.weight = a.weight ?? index));
    parts.sort((a, b) => a.weight! - b.weight!);
    parts.forEach((part) => this._parts[part.position]?.push(part));

    this.dispatch('headerUpdated');
  }
}
