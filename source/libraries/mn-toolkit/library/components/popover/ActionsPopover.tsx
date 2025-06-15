import { classNames, isString } from 'mn-tools';
import { IRouterHrefParams, TRouterState, TBackgroundColor, TForegroundColor } from '../../system';
import { VerticalStack } from '../container';
import { Typography } from '../typography';
import { Icon, TIconId } from '../icon';
import { IAbstractPopoverProps, IAbstractPopoverState, AbstractPopover } from './AbstractPopover';

export interface IActionsPopoverAction<ID = number, T extends TRouterState = TRouterState> {
  id?: ID;
  className?: string;
  weight?: number;
  label?: string;
  onTap?: (event: React.MouseEvent<HTMLLIElement>) => void | Promise<void>;
  bg?: TBackgroundColor;
  icon?: {
    icon?: TIconId;
    name?: string;
    hint?: string;
    color?: TForegroundColor;
  };
  separator?: boolean;
  disabled?: boolean;
  selected?: boolean;
  button?: {
    name?: string;
    hint?: string;
    icon: TIconId;
    onTap: (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => void | Promise<void>;
  };
  isTitle?: boolean;
  isSubTitle?: boolean;
  href?: string | IRouterHrefParams<T>;
}

type TActionsPopoverPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface IActionsPopoverProps<ID = number> extends IAbstractPopoverProps {
  maxVisibleActions?: number;
  actionHeight?: number;
  actions: IActionsPopoverAction<ID>[];
}

export interface IActionsPopoverState<ID = number> extends IAbstractPopoverState {
  position: TActionsPopoverPosition;
  actions: IActionsPopoverAction<ID>[];
}

export class ActionsPopover<
  ID = number,
  P extends IActionsPopoverProps<ID> = IActionsPopoverProps<ID>,
  S extends IActionsPopoverState<ID> = IActionsPopoverState<ID>,
> extends AbstractPopover<P, S> {
  public static override get defaultProps(): IActionsPopoverProps {
    return {
      ...super.defaultProps,
      actionHeight: app.$theme.settings.commons?.['default-item-height']?.value || 32,
      actions: [],
    };
  }

  protected override calculatePosition() {
    let { targetRectangle, syncWidth, syncHeight, actions: propsActions, maxVisibleActions, left, top } = this.props;
    if (!targetRectangle) return;

    const actions = propsActions.filter((a) => !!a);
    actions.sort((a, b) => (a.weight || 0) - (b.weight || 0));

    const eventBottom = targetRectangle.bottom;
    const eventLeft = targetRectangle.left;
    const eventRight = targetRectangle.right;
    const eventTop = targetRectangle.top;

    const { screenWidth, screenHeight } = app.$device;
    const preferredHeight = syncHeight ? targetRectangle.height : this.props.height;
    const preferredWidth = syncWidth ? targetRectangle.width : this.props.width!;
    const actionHeight = this.props.actionHeight!;

    let totalActions = actions.length;
    let maxActionsHeight = 0;
    for (let i = 0; i < totalActions; i++) {
      if (maxVisibleActions && i === maxVisibleActions) break;
      if (actions[i]!.separator) maxActionsHeight += 1;
      else maxActionsHeight += actionHeight;
    }

    let popoverHeight = preferredHeight ? Math.min(preferredHeight, maxActionsHeight) : maxActionsHeight;
    let popoverWidth = preferredWidth;

    // Default position below target element
    top = top || eventBottom;
    left = left || eventLeft;
    let verticalPosition: 'top' | 'bottom' = 'bottom';
    let horizontalPosition: 'left' | 'right' = 'left';

    // Adjust if popover goes beyond the right edge
    if (left! + popoverWidth > screenWidth) {
      left = eventRight - popoverWidth;
      horizontalPosition = 'right';
    }

    // Adjust if popover goes beyond the bottom edge
    if (top! + popoverHeight > screenHeight) {
      top = eventTop - popoverHeight; // Place above the target element
      verticalPosition = 'top';
    }

    // Further adjustments if popover does not fit in initial position
    if (left! < 0) {
      if (screenWidth - eventRight > eventLeft) {
        // More space on the right
        left = eventRight;
        popoverWidth = preferredWidth ? Math.min(preferredWidth, screenWidth - eventRight) : screenWidth - eventRight;
        horizontalPosition = 'right';
      } else {
        // More space on the left
        popoverWidth = preferredWidth ? Math.min(preferredWidth, eventLeft) : eventLeft;
        left = 0; // Align with the left edge of the screen
        horizontalPosition = 'left';
      }
    }

    if (top! < 0) {
      if (screenHeight - eventBottom > eventTop) {
        // More space below
        top = eventBottom;
        popoverHeight = preferredHeight
          ? Math.min(preferredHeight, screenHeight - eventBottom)
          : screenHeight - eventBottom;
        verticalPosition = 'bottom';
      } else {
        // More space above
        popoverHeight = preferredHeight ? Math.min(preferredHeight, eventTop) : eventTop;
        top = 0; // Align with the top edge of the screen
        verticalPosition = 'top';
      }
    }

    // Final adjustments for width and height based on the space available
    while (popoverHeight < actionHeight && totalActions > 0) {
      totalActions--;
      popoverHeight -= actionHeight;
    }

    const position = `${verticalPosition}-${horizontalPosition}` as TActionsPopoverPosition;

    this.setState({
      actions,
      style: { top, left, width: popoverWidth!, height: popoverHeight },
      position,
      visible: true,
    });
  }

  protected override checkHeight() {}

  protected renderContent() {
    return (
      <VerticalStack className='mn-popover-actions-container'>
        <ul>
          {this.state.actions.map((action, i) => {
            if (action.separator) return this.renderSeparator(action, i);
            return this.renderAction(action, i);
          })}
        </ul>
      </VerticalStack>
    );
  }

  protected renderSeparator(action: IActionsPopoverAction<ID>, i: number) {
    return (
      <hr
        key={`action-separator-${i}`}
        id={action.id ? `${action.id}` : undefined}
        className={classNames('action', 'separator', action.className)}
      />
    );
  }

  protected renderActionClasses(action: IActionsPopoverAction<ID>) {
    const classes: { [key: string]: boolean } = {};
    classes['action'] = true;
    if (action.className) classes[action.className] = true;
    if (action.bg) classes[`mn-bg-${action.bg}`] = true;
    classes['selected'] = !!action.selected;
    classes['title'] = !!action.isTitle;
    classes['sub-title'] = !!action.isSubTitle;
    classes['has-click'] = !!action.onTap;
    classes['mn-disabled'] = !!action.disabled;
    return classes;
  }

  protected renderAction(action: IActionsPopoverAction<ID>, i: number) {
    return (
      <li
        key={`action-${i}`}
        id={action.id ? `${action.id}` : undefined}
        className={classNames(this.renderActionClasses(action))}
        onClick={(event) => !!action.onTap && app.$errorManager.handlePromise(this.onTapAction(event, action))}
      >
        {!!action.icon?.icon && (
          <Icon
            icon={action.icon.icon}
            name={action.icon.name}
            hint={action.icon.hint}
            color={action.icon.color}
            onTap={!action.href ? undefined : () => this.onGoToHref(action)}
          />
        )}

        <Typography
          fill
          noWrap
          bold={action.isTitle}
          variant='document'
          contentType='text'
          content={action.label}
          href={action.href}
          onTap={!action.href ? undefined : () => this.close()}
        />

        {!!action.button?.icon && (
          <Icon
            icon={action.button.icon}
            name={action.button.name}
            hint={action.button.hint}
            onTap={(e) => this.onTapActionButton(e, action)}
          />
        )}
      </li>
    );
  }

  protected async onTapActionButton(
    event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>,
    action: IActionsPopoverAction<ID>
  ) {
    await action.button!.onTap(event);
    if (action.href) await this.onGoToHref(action);
  }

  protected async onGoToHref(action: IActionsPopoverAction<ID>) {
    if (!action.href) return;

    await this.close();

    if (isString(action.href)) {
      window.open(action.href, '_blank');
    } else {
      await app.$router.go(action.href.state, action.href.params);
    }
  }

  protected async onTapAction(event: React.MouseEvent<HTMLLIElement>, action: IActionsPopoverAction<ID>) {
    if (!action.href) await this.close();
    if (action.onTap) await action.onTap(event);
  }
}
