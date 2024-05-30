import { HorizontalStack } from 'mn-toolkit/container';
import { IAbstractPopoverProps, IAbstractPopoverState, AbstractPopover } from './AbstractPopover';
import { Typography } from 'mn-toolkit/typography';
import { Icon, TIconId } from 'mn-toolkit/icon';
import { classNames } from 'mn-tools';
import { TBackgroundColor, TForegroundColor, themeSettings } from 'mn-toolkit/themeSettings';
import { MouseEvent } from 'react';

export interface IActionsPopoverAction<ID = number> {
  id?: ID;
  className?: string;
  label?: string;
  onTap?: (event: React.MouseEvent) => void | Promise<void>;
  bg?: TBackgroundColor;
  icon?: TIconId;
  iconColor?: TForegroundColor;
  separator?: boolean;
  disabled?: boolean;
  selected?: boolean;
}

type TActionsPopoverPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface IActionsPopoverProps<ID = number> extends IAbstractPopoverProps {
  maxVisibleActions?: number;
  actionHeight?: number;
  actions: IActionsPopoverAction<ID>[];
}

interface IActionsPopoverState extends IAbstractPopoverState {
  position: TActionsPopoverPosition;
}

export class ActionsPopover<ID = number> extends AbstractPopover<IActionsPopoverProps<ID>, IActionsPopoverState> {
  public static get defaultProps(): Partial<IActionsPopoverProps> {
    return {
      ...AbstractPopover.defaultProps,
      actionHeight: themeSettings().themeDefaultItemHeight,
      actions: [],
    };
  }

  protected calculatePosition() {
    const { targetRectangle, syncWidth, syncHeight, actions, maxVisibleActions } = this.props;
    if (!targetRectangle) return;

    const eventBottom = targetRectangle.bottom;
    const eventLeft = targetRectangle.left;
    const eventRight = targetRectangle.right;
    const eventTop = targetRectangle.top;

    const { screenWidth, screenHeight } = app.$device;
    const preferredHeight = syncHeight ? targetRectangle.height : this.props.height!;
    const preferredWidth = syncWidth ? targetRectangle.width : this.props.width!;
    const actionHeight = this.props.actionHeight!;

    let totalActions = actions.length;
    let maxActionsHeight = 0;
    for (let i = 0; i < totalActions; i++) {
      if (maxVisibleActions && i === maxVisibleActions) break;
      if (actions[i].separator) maxActionsHeight += 1;
      else maxActionsHeight += actionHeight;
    }

    let popoverHeight = preferredHeight ? Math.min(preferredHeight, maxActionsHeight) : maxActionsHeight;
    let popoverWidth = preferredWidth;

    // Default position below target element
    let top = eventBottom;
    let left = eventLeft;
    let verticalPosition: 'top' | 'bottom' = 'bottom';
    let horizontalPosition: 'left' | 'right' = 'left';

    // Adjust if popover goes beyond the right edge
    if (left + popoverWidth > screenWidth) {
      left = eventRight - popoverWidth;
      horizontalPosition = 'right';
    }

    // Adjust if popover goes beyond the bottom edge
    if (top + popoverHeight > screenHeight) {
      top = eventTop - popoverHeight; // Place above the target element
      verticalPosition = 'top';
    }

    // Further adjustments if popover does not fit in initial position
    if (left < 0 || top < 0) {
      if (screenWidth - eventRight > eventLeft) {
        // More space on the right
        left = eventRight;
        popoverWidth = Math.min(preferredWidth, screenWidth - eventRight);
        horizontalPosition = 'right';
      } else {
        // More space on the left
        popoverWidth = Math.min(preferredWidth, eventLeft);
        left = 0; // Align with the left edge of the screen
        horizontalPosition = 'left';
      }

      if (screenHeight - eventBottom > eventTop) {
        // More space below
        top = eventBottom;
        popoverHeight = Math.min(preferredHeight, screenHeight - eventBottom);
        verticalPosition = 'bottom';
      } else {
        // More space above
        popoverHeight = Math.min(preferredHeight, eventTop);
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

    this.setState({ style: { top, left, width: popoverWidth, height: popoverHeight }, position });
  }

  protected renderContent() {
    return this.props.actions.map((action, i) => {
      return (
        <HorizontalStack
          key={`action-${i}`}
          id={action.id ? `${action.id}` : undefined}
          gutter
          bg={action.bg}
          disabled={action.disabled}
          verticalItemAlignment='middle'
          className={classNames('action', action.className, { selected: action.selected, separator: action.separator })}
          onTap={
            !action.onTap ? undefined : (event) => app.$errorManager.handlePromise(this.onTapAction(event, action))
          }
        >
          <Typography fill content={action.label} />
          {!!action.icon && <Icon iconId={action.icon} color={action.iconColor} />}
        </HorizontalStack>
      );
    });
  }

  private async onTapAction(event: React.MouseEvent, action: IActionsPopoverAction<ID>) {
    await this.close();
    await action.onTap!(event);
  }
}
