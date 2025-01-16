import { classNames, isString } from 'mn-tools';
import { TDidUpdateSnapshot } from '../containable';
import { IContainerProps, IContainerState, Container } from '../container';
import { Icon } from '../icon';
import { Typography } from '../typography';
import { IMenuItem, isMenuItemActive } from '.';

interface ILeftMenuProps extends IContainerProps {
  items: IMenuItem[];
  hideGroupLabels?: boolean;
  onClickItem?: (item: IMenuItem) => void | Promise<void>;
}

interface ILeftMenuState extends IContainerState {
  items: IMenuItem[];
  open: IMenuItem[];
}

export class LeftMenu extends Container<ILeftMenuProps, ILeftMenuState> {
  public static override get defaultProps(): ILeftMenuProps {
    return {
      ...super.defaultProps,
      scroll: true,
      layout: 'vertical',
      hideGroupLabels: false,
      items: [],
    };
  }

  public constructor(props: ILeftMenuProps) {
    super(props);
    this.state = { ...this.state, items: props.items, open: [] };
  }

  public override componentDidUpdate(
    prevProps: Readonly<ILeftMenuProps>,
    prevState: Readonly<ILeftMenuState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    if (this.props.items !== this.state.items) {
      this.setState({ items: this.props.items });
    }
  }

  private hideBeforeClick() {
    if (app.$overlay.active) app.$overlay.hide();
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-left-menu'] = true;
    classes['mn-dark-theme'] = true;
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
        onClick={() => item.collapsable && app.$errorManager.handlePromise(this.openGroup(item))}
        className={classNames(
          'mn-left-menu-group',
          { open: !item.collapsable || this.groupOpen(item) },
          item.className
        )}
      >
        <Typography
          className={classNames('mn-left-menu-label', { hide: !!this.props.hideGroupLabels })}
          bold={!item.href}
          color='2'
          content={item.label}
          href={item.href}
        />
        <div className='mn-left-menu-subitems'>
          {!!item.below && item.below.map((subItems) => this.renderSubItem(subItems))}{' '}
        </div>
      </div>
    );
  }

  private async openGroup(item: IMenuItem) {
    if (!this.groupOpen(item)) {
      await this.setStateAsync({ open: this.state.open.concat([item]) });
    } else {
      await this.setStateAsync({ open: this.state.open.filter((x) => x !== item) });
    }
  }

  private groupOpen(item: IMenuItem) {
    return !!this.state.open.find((x) => x === item);
  }

  private onClickItem(item: IMenuItem, e: React.MouseEvent<HTMLDivElement>) {
    if (item.onTap) {
      this.hideBeforeClick();
      item.onTap(e);
    }
    if (this.props.onClickItem) app.$errorManager.handlePromise(this.props.onClickItem(item));
  }

  private async goToHref(href: IMenuItem['href']) {
    if (isString(href)) {
      window.location.href = href;
    } else {
      await app.$router.go(href!.state, href!.params);
    }
  }

  private renderSubItem(subItem: IMenuItem) {
    if (subItem.permission && !app.$permission.hasPermission(subItem.permission)) return null;
    const isActive = isMenuItemActive(subItem);
    return (
      <div
        key={`mn-left-menu-subitem-${subItem.id}-${subItem.label}`}
        className={classNames('mn-left-menu-subitem', { active: isActive })}
        onClick={(e) => this.onClickItem(subItem, e)}
      >
        {!subItem.icon && <span className='mn-left-menu-icon' />}
        {!!subItem.icon && (
          <Icon
            icon={subItem.icon}
            className='mn-left-menu-icon'
            onTap={!subItem.href ? undefined : () => this.goToHref(subItem.href)}
          />
        )}

        <Typography
          className='mn-left-menu-subitem-text'
          href={subItem.href}
          bold={isActive}
          color='1'
          content={subItem.label}
        />
      </div>
    );
  }

  private hasPermission(item: IMenuItem) {
    if (!item.permission) return true;
    return app.$permission.hasPermission(item.permission);
  }
}
