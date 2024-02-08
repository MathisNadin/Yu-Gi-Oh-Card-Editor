import { classNames } from 'libraries/mn-tools';
import { TID } from '../application';
import { IContainerProps, IContainerState, Container, ScrollContainer } from '../container';
import { TIconId, Icon } from '../icon';
import { IStateParameters } from '../router';

export interface IMenuItem {
  id?: TID;
  label?: string;
  icon?: TIconId;
  iconColor?: string;
  badge?: string | number;
  collapsable?: boolean;
  selected?: boolean;
  onTap?: (event?: React.MouseEvent) => void;
  state?: keyof IRouter;
  stateParameters?: object;
  defaultState?: string;
  defaultStateParameters?: object;
  height?: number;
  // permission?: string;
  className?: string;
  minHeight?: number;
  below?: IMenuItem[];
}

interface IMenuProps extends IContainerProps {
  items: IMenuItem[];
}

interface IMenuState extends IContainerState {
  items: IMenuItem[];
  open: IMenuItem[];
}

export class Menu extends Container<IMenuProps, IMenuState> {
  public static get defaultProps(): Partial<IMenuProps> {
    return {
      ...super.defaultProps,
      scroll: true,
      layout: 'vertical',
    };
  }

  public constructor(props: IMenuProps) {
    super(props);
    this.setState({ items: props.items, open: [] });
  }

  public componentWillReceiveProps(props: IMenuProps) {
    this.setState({ items: props.items });
  }

  private hideBeforeClick() {
    if (app.$drawer.active) app.$drawer.close();
    if (app.$overlay.active) app.$overlay.hide();
  }

  private isSameParameters(params: IStateParameters) {
    params = params || {};
    if (app.$router.currentState) {
      for (let record of app.$router.currentState.pathKeys) {
        let k = record.name;
        let routerParam = app.$router.parameters[k];
        let param = params[k];

        // Pour éviter les return false qui n'ont en vérité pas lieu d'être
        if (typeof routerParam === 'number') routerParam = `${routerParam}`;
        if (typeof param === 'number') param = `${param}`;

        // log.debug(k, routerParam, param);
        if (routerParam !== param) return false;
      }
    }
    return true;
  }

  private hasSameState(item: IMenuItem) {
    const currentState = app.$router.currentState;
    return currentState && item.state === currentState.name && this.isSameParameters(item.stateParameters as object);
  }

  private isItemActive(item: IMenuItem) {
    return item.selected || this.hasSameState(item); // || (item.below && !!item.below.find(item => this.hasSameState(item)));
  }

  public render() {
    if (!this.props.scroll) return this.renderAttributes(<div>{this.inside()}</div>, 'mn-menu');
    return (
      <ScrollContainer
        style={this.renderStyle()}
        className={classNames(super.renderClasses())}
        viewClassName={classNames(this.renderClasses('mn-menu'))}
        scroll={!!this.props.scroll}
        scrollX={!!this.props.scrollX}
      >
        {this.inside()}
      </ScrollContainer>
    );
  }

  public inside() {
    return this.state.items.filter((item) => this.hasPermission(item)).map((item) => this.renderGroup(item));
  }

  private renderGroup(item: IMenuItem) {
    // if (!!item.permission && !app.$permission.hasPermission(item.permission)) return null;
    return (
      <div
        onClick={() => item.collapsable && this.openGroup(item)}
        className={classNames('mn-menu-group', { open: !item.collapsable || this.groupOpen(item) }, item.className)}
      >
        <div className={classNames('mn-menu-label')}>{item.label}</div>
        <div className='mn-menu-subitems'>
          {' '}
          {!!item.below && item.below.map((subItems) => this.renderSubItem(subItems))}{' '}
        </div>
      </div>
    );
  }

  private openGroup(item: IMenuItem) {
    if (!this.groupOpen(item)) {
      this.setState({ open: this.state.open.concat([item]) });
    } else {
      this.setState({ open: this.state.open.filter((x) => x !== item) });
    }
  }

  private groupOpen(item: IMenuItem) {
    return !!this.state.open.find((x) => x === item);
  }

  private onClickItem(item: IMenuItem, e: React.MouseEvent) {
    if (item.onTap) {
      this.hideBeforeClick();
      item.onTap(e);
    } else if (item.state) {
      this.hideBeforeClick();
      app.$router.go(item.state, item.stateParameters);
    } else if (item.defaultState) {
      this.hideBeforeClick();
      app.$router.go(item.defaultState, item.defaultStateParameters);
    }
    this.forceUpdate();
  }

  private renderSubItem(subItem: IMenuItem) {
    // if (!app.$permission.hasPermission(subItem.permission)) return null;
    return (
      <div
        className={classNames('mn-menu-subitem', { active: this.isItemActive(subItem) })}
        onClick={(e) => this.onClickItem(subItem, e)}
      >
        {subItem.icon ? <Icon iconId={subItem.icon} className='mn-menu-icon' /> : <span className='mn-menu-icon' />}
        <div className='mn-menu-subitem-text'>{subItem.label}</div>
      </div>
    );
  }

  private hasPermission(item: IMenuItem) {
    return true;
    /* if (!item.permission) return true;
    return app.$permission.hasPermission(item.permission); */
  }
}
