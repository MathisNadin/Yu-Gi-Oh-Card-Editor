import { IDeviceListener, TJSXElementChildren, TForegroundColor, TJSXElementChild } from '../../system';
import { TDidUpdateSnapshot } from '../containable';
import { IContainerProps, IContainerState, Container, HorizontalStack } from '../container';
import { Typography } from '../typography';
import { IActionsPopoverAction } from '../popover';
import { Icon } from '../icon';
import { IMenuItem, isMenuItemActive } from '.';

interface ITopMenuProps extends IContainerProps<HTMLElement> {
  items: IMenuItem[];
  leftContent?: TJSXElementChildren;
  rightContent?: TJSXElementChildren;
}

interface ITopMenuState extends IContainerState {
  items: IMenuItem[];
  currentlyShown?: IMenuItem;
}

export class TopMenu extends Container<ITopMenuProps, ITopMenuState, HTMLElement> implements Partial<IDeviceListener> {
  public static override get defaultProps(): ITopMenuProps {
    return {
      ...super.defaultProps,
      theme: 'dark',
      bg: '1',
      wrap: true,
      layout: 'horizontal',
      gutter: true,
      itemAlignment: 'center',
      items: [],
    };
  }

  public constructor(props: ITopMenuProps) {
    super(props);
    this.state = { ...this.state, items: props.items };
    app.$device.addListener(this);
  }

  public override componentDidUpdate(
    prevProps: Readonly<ITopMenuProps>,
    prevState: Readonly<ITopMenuState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    if (this.props.items !== this.state.items) {
      this.setState({ items: this.props.items });
    }
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    app.$device.removeListener(this);
  }

  public deviceBackground() {
    app.$errorManager.handlePromise(this.closePopover());
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-top-menu'] = true;
    return classes;
  }

  public override render(): TJSXElementChild {
    return (
      <nav ref={this.base} {...this.renderAttributes()}>
        {this.inside}
      </nav>
    );
  }

  public override get inside() {
    return (
      <div className='mn-container-inside' onMouseLeave={(e) => this.closePopover(e)}>
        <HorizontalStack
          fill
          height='100%'
          onMouseEnter={(e) => this.closePopover(e)}
          itemAlignment='left'
          verticalItemAlignment='middle'
        >
          {this.props.leftContent}
        </HorizontalStack>

        <ul>{this.state.items.filter((item) => this.hasPermission(item)).map((item) => this.renderGroup(item))}</ul>

        <HorizontalStack
          fill
          height='100%'
          onMouseEnter={(e) => this.closePopover(e)}
          itemAlignment='right'
          verticalItemAlignment='middle'
        >
          {this.props.rightContent}
        </HorizontalStack>
      </div>
    );
  }

  private renderGroup(item: IMenuItem) {
    if (item.permission && !app.$permission.hasPermission(item.permission)) return null;
    const hasBelow = !!item.below?.length;
    const labelColor: TForegroundColor = isMenuItemActive(item) || this.state.currentlyShown === item ? 'primary' : '1';
    return (
      <li
        key={`mn-top-menu-group-${item.id}-${item.label}`}
        className='mn-top-menu-group'
        onMouseEnter={(event) => (hasBelow ? this.showBelow(event, item) : this.closePopover(event))}
      >
        <HorizontalStack className='mn-top-menu-group-container' itemAlignment='center' verticalItemAlignment='middle'>
          <Typography
            className='mn-top-menu-label'
            bold
            variant='document'
            color={labelColor}
            content={item.label}
            href={item.href}
            onTap={hasBelow || !item.onTap ? undefined : (e) => item.onTap!(e)}
          />

          {hasBelow && <Icon icon='toolkit-angle-down' size={16} color={labelColor} />}
        </HorizontalStack>

        {hasBelow && (
          <ul className='crawler-hidden-item-list'>
            {item.below!.map((item, i) => (
              <li key={i}>
                <Typography href={item.href} content={item.label} />
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  private isTargetOrParentOfClasses(
    event: React.MouseEvent<HTMLDivElement | HTMLLIElement> | undefined,
    classNames: string[]
  ): boolean {
    if (!event?.relatedTarget || !(event.relatedTarget instanceof HTMLElement)) {
      return false;
    }

    let currentElement: HTMLElement | null = event.relatedTarget;

    while (currentElement) {
      for (const className of classNames) {
        if (currentElement.classList.contains(className)) {
          return true;
        }
      }
      currentElement = currentElement.parentElement;
    }

    return false;
  }

  public async closePopover(event?: React.MouseEvent<HTMLDivElement | HTMLLIElement>) {
    if (
      !app.$popover.visible ||
      this.isTargetOrParentOfClasses(event, ['mn-top-menu-group', 'mn-top-menu-below-popover'])
    ) {
      return;
    }

    app.$popover.removeAll();
    await this.setStateAsync({ currentlyShown: undefined });
  }

  private async showBelow(event: React.MouseEvent<HTMLLIElement>, item: IMenuItem) {
    if (app.$popover.visible && this.state.currentlyShown === item) return;

    const eventTarget = event.target as HTMLLIElement;
    const eventTargetParent = eventTarget?.parentElement as HTMLDivElement;
    if (!eventTargetParent) return;

    app.$popover.removeAll();

    await this.setStateAsync({ currentlyShown: item });

    const actions: IActionsPopoverAction[] = [];
    for (const subItem of item.below!) {
      if (subItem.permission && !app.$permission.hasPermission(subItem.permission)) continue;
      actions.push({
        icon: subItem.icon,
        iconColor: '1',
        label: subItem.label,
        href: subItem.href,
        selected: isMenuItemActive(subItem),
      });
    }

    // Même longueur que le menu qu'on vient de survoler
    let width = eventTargetParent.offsetWidth;
    if (item.groupMinWidth && (!width || width < item.groupMinWidth)) {
      width = item.groupMinWidth;
    }

    let rect = eventTargetParent.getBoundingClientRect();
    if (this.base.current) {
      const baseRect = this.base.current.getBoundingClientRect();
      rect = {
        x: rect.x,
        y: rect.y,
        height: rect.height,
        width: rect.width,
        left: rect.left,
        right: rect.right,
        toJSON: rect.toJSON,
        top: baseRect.top,
        bottom: baseRect.bottom,
      };
    }

    app.$popover.actions(rect, {
      actions,
      width,
      className: 'mn-top-menu-below-popover',
      onClose: () => this.setStateAsync({ currentlyShown: undefined }),
      onMouseLeave: (e) => this.closePopover(e),
    });
  }

  private hasPermission(item: IMenuItem) {
    if (!item.permission) return true;
    return app.$permission.hasPermission(item.permission);
  }
}
