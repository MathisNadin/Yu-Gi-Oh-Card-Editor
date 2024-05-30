import { classNames } from 'mn-tools';
import { IContainerProps, IContainerState, Container } from '../container';
import { Icon } from '../icon';
import { IStateParameters } from '../router';
import { IMenuItem } from '.';
import { Typography } from '../typography';

interface ILeftMenuProps extends IContainerProps {
  items: IMenuItem[];
  hideGroupLabels?: boolean;
  onClickItem?: (item: IMenuItem) => void;
}

interface ILeftMenuState extends IContainerState {
  items: IMenuItem[];
  open: IMenuItem[];
}

export class LeftMenu extends Container<ILeftMenuProps, ILeftMenuState> {
  public static get defaultProps(): Partial<ILeftMenuProps> {
    return {
      ...super.defaultProps,
      scroll: true,
      layout: 'vertical',
      hideGroupLabels: false,
    };
  }

  public constructor(props: ILeftMenuProps) {
    super(props);
    this.state = { ...this.state, items: props.items, open: [] };
  }

  public componentDidUpdate() {
    if (this.props.items !== this.state.items) {
      this.setState({ items: this.props.items });
    }
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

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-left-menu'] = true;
    return classes;
  }

  public get children() {
    return this.state.items.filter((item) => this.hasPermission(item)).map((item) => this.renderGroup(item));
  }

  private renderGroup(item: IMenuItem) {
    if (item.permission && !app.$permission.hasPermission(item.permission)) return null;
    return (
      <div
        key={`mn-left-menu-group-${item.id}-${item.label}`}
        onClick={() => item.collapsable && this.openGroup(item)}
        className={classNames(
          'mn-left-menu-group',
          { open: !item.collapsable || this.groupOpen(item) },
          item.className
        )}
      >
        <Typography
          className={classNames('mn-left-menu-label', { hide: !!this.props.hideGroupLabels })}
          bold
          color='4'
          content={item.label}
        />
        <div className='mn-left-menu-subitems'>
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
    if (this.props.onClickItem) this.props.onClickItem(item);
  }

  private renderSubItem(subItem: IMenuItem) {
    if (subItem.permission && !app.$permission.hasPermission(subItem.permission)) return null;
    const isActive = this.isItemActive(subItem);
    return (
      <div
        key={`mn-left-menu-subitem-${subItem.id}-${subItem.label}`}
        className={classNames('mn-left-menu-subitem', { active: isActive })}
        onClick={(e) => this.onClickItem(subItem, e)}
      >
        {subItem.icon ? (
          <Icon iconId={subItem.icon} className='mn-left-menu-icon' />
        ) : (
          <span className='mn-left-menu-icon' />
        )}
        <Typography className='mn-left-menu-subitem-text' bold={isActive} color='1' content={subItem.label} />
      </div>
    );
  }

  private hasPermission(item: IMenuItem) {
    if (!item.permission) return true;
    return app.$permission.hasPermission(item.permission);
  }
}
