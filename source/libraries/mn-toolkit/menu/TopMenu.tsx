import { IContainerProps, IContainerState, Container, HorizontalStack } from '../container';
import { Icon } from '../icon';
import { IMenuItem } from '.';
import { Typography } from '../typography';
import { IActionsPopoverAction } from '../popover';

interface ITopMenuProps extends IContainerProps {
  items: IMenuItem[];
  dark?: boolean;
}

interface ITopMenuState extends IContainerState {
  items: IMenuItem[];
}

export class TopMenu extends Container<ITopMenuProps, ITopMenuState> {
  public static get defaultProps(): Partial<ITopMenuProps> {
    return {
      ...super.defaultProps,
      wrap: true,
      layout: 'horizontal',
      gutter: true,
      itemAlignment: 'center',
    };
  }

  public constructor(props: ITopMenuProps) {
    super(props);
    this.state = { ...this.state, items: props.items };
  }

  public componentDidUpdate() {
    if (this.props.items !== this.state.items) {
      this.setState({ items: this.props.items });
    }
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-top-menu'] = true;
    classes['mn-dark-theme'] = !!this.props.dark;
    return classes;
  }

  public get inside() {
    return (
      <div className='mn-container-inside' onMouseLeave={(e) => this.closePopover(e)}>
        <HorizontalStack fill height='100%' onMouseEnter={() => this.closePopover()} />
        {this.state.items.filter((item) => this.hasPermission(item)).map((item) => this.renderGroup(item))}
        <HorizontalStack fill height='100%' onMouseEnter={() => this.closePopover()} />
      </div>
    );
  }

  private renderGroup(item: IMenuItem) {
    if (item.permission && !app.$permission.hasPermission(item.permission)) return null;
    const hasBelow = !!item.below?.length;
    return (
      <HorizontalStack
        key={`mn-top-menu-group-${item.id}-${item.label}`}
        className='mn-top-menu-group'
        height='100%'
        itemAlignment='center'
        verticalItemAlignment='middle'
      >
        <HorizontalStack
          className='mn-top-menu-group-container'
          itemAlignment='center'
          verticalItemAlignment='middle'
          onMouseEnter={!hasBelow ? undefined : (event) => this.showBelow(event, item)}
        >
          <Typography
            className='mn-top-menu-label'
            bold
            variant='document'
            color='1'
            content={item.label}
            onTap={hasBelow ? undefined : (e) => this.onClickItem(item, e)}
          />

          {hasBelow && <Icon iconId='toolkit-angle-down' size={16} color='1' />}
        </HorizontalStack>
      </HorizontalStack>
    );
  }

  private closePopover(event?: React.MouseEvent) {
    if (!app.$popover.visible) return;

    const relatedTarget = event?.relatedTarget as HTMLDivElement;
    const relatedTargetParent = relatedTarget?.parentElement;
    if (relatedTarget?.className?.includes('action') || relatedTargetParent?.className?.includes('action')) {
      return;
    }

    app.$popover.removeAll();
  }

  private showBelow(event: React.MouseEvent, item: IMenuItem) {
    this.closePopover();

    const actions: IActionsPopoverAction[] = [];
    for (const subItem of item.below!) {
      if (subItem.permission && !app.$permission.hasPermission(subItem.permission)) continue;
      actions.push({
        icon: subItem.icon,
        iconColor: '1',
        label: subItem.label,
        onTap: (e) => this.onClickItem(subItem, e),
      });
    }

    // Même longueur que le menu qu'on vient de survoler
    let width = (event?.target as HTMLDivElement)?.parentElement?.offsetWidth;

    if (item.groupMinWidth && (!width || width < item.groupMinWidth)) {
      width = item.groupMinWidth;
    }

    app.$popover.actions(event, {
      actions,
      width,
      className: 'mn-top-menu-below-popover',
      targetRectangle: (event.target as HTMLDivElement)?.parentElement?.getBoundingClientRect(),
    });
  }

  private onClickItem(item: IMenuItem, e: React.MouseEvent) {
    if (item.onTap) {
      item.onTap(e);
    } else if (item.state) {
      app.$router.go(item.state, item.stateParameters);
    } else if (item.defaultState) {
      app.$router.go(item.defaultState, item.defaultStateParameters);
    }
    this.forceUpdate();
  }

  private hasPermission(item: IMenuItem) {
    if (!item.permission) return true;
    return app.$permission.hasPermission(item.permission);
  }
}
