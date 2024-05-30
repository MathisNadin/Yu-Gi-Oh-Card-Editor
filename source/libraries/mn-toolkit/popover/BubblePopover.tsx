import { IAbstractPopoverProps, IAbstractPopoverState, AbstractPopover } from './AbstractPopover';

type TBubblePopoverPosition =
  | 'top-center'
  | 'top-left'
  | 'top-right'
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right';

export interface IBubblePopoverProps extends IAbstractPopoverProps {
  triangleWidth?: number;
  triangleHeight?: number;
}

interface IBubblePopoverState extends IAbstractPopoverState {
  position: TBubblePopoverPosition;
}

export class BubblePopover extends AbstractPopover<IBubblePopoverProps, IBubblePopoverState> {
  public static get defaultProps(): Partial<IBubblePopoverProps> {
    return {
      ...AbstractPopover.defaultProps,
      triangleWidth: 15,
      triangleHeight: 20,
    };
  }

  protected calculatePosition() {
    const { targetRectangle, syncWidth, syncHeight } = this.props;
    if (!targetRectangle) return;

    const targetMidX = targetRectangle.left + targetRectangle.width / 2;
    const targetMidY = targetRectangle.top + targetRectangle.height / 2;

    const { screenWidth, screenHeight } = app.$device;
    const preferredHeight = syncHeight ? targetRectangle.height : this.props.height!;
    const preferredWidth = syncWidth ? targetRectangle.width : this.props.width!;
    const triangleWidth = this.props.triangleWidth!;
    const triangleHeight = this.props.triangleHeight!;

    // Initial guesses
    let left = targetMidX - preferredWidth / 2;
    let top = targetMidY - preferredHeight / 2;
    let horizontalPosition: 'center' | 'left' | 'right' = 'center';
    let verticalPosition: 'top' | 'bottom' = 'bottom'; // Favor top, but start with bottom for logic

    // Adjust for screen edges
    if (left + preferredWidth + triangleWidth > screenWidth) {
      left = screenWidth - preferredWidth - triangleWidth;
      horizontalPosition = 'right';
    } else if (left - triangleWidth < 0) {
      left = triangleWidth;
      horizontalPosition = 'left';
    }

    // Adjust vertical position based on available space
    if (targetMidY - preferredHeight - triangleHeight > 0) {
      top = targetMidY - preferredHeight - triangleHeight;
      verticalPosition = 'top';
    } else if (targetMidY + preferredHeight + triangleHeight < screenHeight) {
      top = targetMidY + triangleHeight;
      verticalPosition = 'bottom';
    }

    // Final adjustments to ensure the popover doesn't go off-screen
    left = Math.max(0, left);
    top = Math.max(0, top);

    // Assemble final position string
    const position = `${verticalPosition}-${horizontalPosition}` as TBubblePopoverPosition;

    this.setState({ style: { top, left, width: preferredWidth, height: preferredHeight }, position });
  }

  protected renderContent() {
    return null;
  }
}
