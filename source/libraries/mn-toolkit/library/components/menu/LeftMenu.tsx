import { classNames, isString } from 'mn-tools';
import { TJSXElementChild } from '../../system';
import { IContainerProps, IContainerState, Container } from '../container';
import { Icon } from '../icon';
import { Typography } from '../typography';
import { IMenuItem, isMenuItemActive } from '.';

interface ILeftMenuProps extends IContainerProps<HTMLElement> {
  items: IMenuItem[];
  hideGroupLabels?: boolean;
  onClickItem?: (event: React.MouseEvent<HTMLLIElement>, item: IMenuItem) => void | Promise<void>;
}

interface ILeftMenuState extends IContainerState {
  open: IMenuItem[];
}

export class LeftMenu extends Container<ILeftMenuProps, ILeftMenuState, HTMLElement> {
  public static override get defaultProps(): Omit<ILeftMenuProps, 'items'> {
    return {
      ...super.defaultProps,
      theme: 'dark',
      scroll: true,
      layout: 'vertical',
      hideGroupLabels: false,
    };
  }

  public constructor(props: ILeftMenuProps) {
    super(props);
    this.state = { ...this.state, open: [] };
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

  public override render(): TJSXElementChild {
    return (
      <nav ref={this.base} {...this.renderAttributes()}>
        {this.inside}
      </nav>
    );
  }

  public override get children() {
    if (!this.props.items.length) return null;
    return <ul>{this.props.items.filter((item) => this.hasPermission(item)).map((item) => this.renderGroup(item))}</ul>;
  }

  private renderGroup(item: IMenuItem) {
    if (item.permission && !app.$permission.hasPermission(item.permission)) return null;
    return (
      <li
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
          fill
          bold={!item.href}
          color='2'
          content={item.label}
          href={item.href}
        />
        <ul className='mn-left-menu-subitems'>
          {!!item.below && item.below.map((subItems) => this.renderSubItem(subItems))}{' '}
        </ul>
      </li>
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

  private onClickItem(event: React.MouseEvent<HTMLLIElement>, item: IMenuItem) {
    if (item.onTap) {
      this.hideBeforeClick();
      item.onTap(event);
    }
    if (this.props.onClickItem) app.$errorManager.handlePromise(this.props.onClickItem(event, item));
  }

  private async goToHref(href: IMenuItem['href']) {
    if (!href) return;
    if (isString(href)) {
      window.location.href = href;
    } else {
      await app.$router.go(href.state, href.params);
    }
  }

  private renderSubItem(subItem: IMenuItem) {
    if (subItem.permission && !app.$permission.hasPermission(subItem.permission)) return null;
    const isActive = isMenuItemActive(subItem);
    return (
      <li
        key={`mn-left-menu-subitem-${subItem.id}-${subItem.label}`}
        className={classNames('mn-left-menu-subitem', { active: isActive })}
        onClick={(e) => this.onClickItem(e, subItem)}
      >
        {!subItem.icon && <span className='mn-left-menu-icon' />}
        {!!subItem.icon && (
          <Icon
            icon={subItem.icon}
            className='mn-left-menu-icon'
            name={!subItem.href ? undefined : 'Visiter le lien'}
            onTap={!subItem.href ? undefined : () => this.goToHref(subItem.href)}
          />
        )}

        <Typography
          className='mn-left-menu-subitem-text'
          fill
          href={subItem.href}
          bold={isActive}
          color='1'
          content={subItem.label}
        />
      </li>
    );
  }

  private hasPermission(item: IMenuItem) {
    if (!item.permission) return true;
    return app.$permission.hasPermission(item.permission);
  }
}
