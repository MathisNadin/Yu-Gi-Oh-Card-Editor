import { Observable } from 'mn-tools';
import { IRouterListener } from '../../system';
import { IActionsPopoverAction } from '../popover';
import { IHeaderCrumb, IHeaderListener, IHeaderComponent as IHeaderPart } from '.';

export class HeaderService extends Observable<IHeaderListener> implements Partial<IRouterListener> {
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

  public alterBreadCrumb(crumbs: IHeaderCrumb[]) {
    this.dispatch('breadcrumbAlter', crumbs);
  }

  private fireGetParts(parts: IHeaderPart[]) {
    this.dispatch('headerGetButtons', parts);
  }

  private fireGetPageActions(actions: IActionsPopoverAction[]) {
    this.dispatch('headerGetPageActions', actions);
  }

  public routerStateChanged() {
    this.update();
  }

  public update() {
    // console.log('update');
    this._pageActions = [];
    this._parts = {
      left: [],
      center: [],
      right: [],
    };
    app.$header.fireGetPageActions(this._pageActions);
    const parts: IHeaderPart[] = [];
    app.$header.fireGetParts(parts);

    parts.forEach((a, index) => {
      a.weight = a.weight || index;
    });
    parts.sort((a, b) => {
      return (a.weight || 0) - (b.weight || 0);
    });
    parts.forEach((part) => this._parts[part.position].push(part));
    this.dispatch('headerUpdated');
  }
}
