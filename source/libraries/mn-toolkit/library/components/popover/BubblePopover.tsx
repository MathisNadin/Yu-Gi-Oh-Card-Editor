import { TJSXElementChild } from '../../system';
import {
  IAbstractPopoverProps,
  IAbstractPopoverState,
  AbstractPopover,
  IAbstractPopoverStyle,
} from './AbstractPopover';

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
  preferBottom?: boolean;
}

export interface IBubblePopoverState extends IAbstractPopoverState {
  position: TBubblePopoverPosition;
}

export class BubblePopover<
  P extends IBubblePopoverProps = IBubblePopoverProps,
  S extends IBubblePopoverState = IBubblePopoverState,
> extends AbstractPopover<P, S> {
  public static override get defaultProps(): IBubblePopoverProps {
    return {
      ...super.defaultProps,
      triangleWidth: 25,
      triangleHeight: 15,
    };
  }

  protected override calculatePosition() {
    let { targetRectangle, syncWidth, syncHeight, top, left, preferBottom } = this.props;
    if (!targetRectangle) return;

    const targetMidX = targetRectangle.left + targetRectangle.width / 2;
    const targetTopY = targetRectangle.top;
    const targetBottomY = targetRectangle.top + targetRectangle.height;

    const { screenWidth, screenHeight } = app.$device;
    let preferredHeight: IAbstractPopoverStyle['height'] = syncHeight ? targetRectangle.height : this.props.height!;
    const preferredWidth = syncWidth ? targetRectangle.width : this.props.width!;
    const triangleWidth = this.props.triangleWidth! * 1.5; // To add some margin
    const triangleHeight = this.props.triangleHeight! * 1.5; // To add some margin

    // Initial guesses
    let horizontalPosition: 'center' | 'left' | 'right' = 'center';
    left = left || targetMidX - preferredWidth / 2;
    let verticalPosition: 'top' | 'bottom' = 'bottom'; // Favor top, but start with bottom for logic
    top = top || targetBottomY + triangleHeight;

    // Adjust for screen edges
    if (left! + preferredWidth + triangleWidth > screenWidth) {
      left = screenWidth - preferredWidth - triangleWidth;
      horizontalPosition = 'right';
    } else if (left! - triangleWidth < 0) {
      left = triangleWidth;
      horizontalPosition = 'left';
    }

    // Adjust vertical position based on available space
    const canBeTop = targetTopY - preferredHeight - triangleHeight > 0;
    const canBeBottom = targetBottomY + preferredHeight + triangleHeight < screenHeight;
    if (canBeTop && (!canBeBottom || !preferBottom)) {
      top = targetTopY - preferredHeight - triangleHeight;
      verticalPosition = 'top';
    } else if (canBeBottom) {
      top = targetBottomY + triangleHeight;
      verticalPosition = 'bottom';
    }

    // Final adjustments to ensure the popover doesn't go off-screen
    left = Math.max(0, left);
    top = Math.max(0, top);

    // Assemble final position string
    const position = `${verticalPosition}-${horizontalPosition}` as TBubblePopoverPosition;

    let visible = true;
    if (!preferredHeight) {
      preferredHeight = 'fit-content';
      visible = false;
    }
    this.setState({ style: { top, left, width: preferredWidth, height: preferredHeight }, position, visible });
  }

  protected override checkHeight() {
    if (this.state.style!.height !== 'fit-content' || this.state.visible || !this.base.current) {
      return;
    }

    let { targetRectangle, top, preferBottom } = this.props;
    if (!targetRectangle) return;

    const targetTopY = targetRectangle.top;
    const targetBottomY = targetRectangle.top + targetRectangle.height;

    const { screenHeight } = app.$device;
    const preferredHeight = this.base.current.clientHeight;
    const triangleHeight = this.props.triangleHeight! * 1.5; // To add some margin

    // Initial guesses
    let horizontalPosition: 'center' | 'left' | 'right';
    switch (this.state.position) {
      case 'top-right':
      case 'bottom-right':
        horizontalPosition = 'right';
        break;

      case 'top-left':
      case 'bottom-left':
        horizontalPosition = 'left';
        break;

      default:
        horizontalPosition = 'center';
        break;
    }
    let verticalPosition: 'top' | 'bottom' = 'bottom'; // Favor top, but start with bottom for logic
    top = top || targetBottomY + triangleHeight;

    // Adjust vertical position based on available space
    const canBeTop = targetTopY - preferredHeight - triangleHeight > 0;
    const canBeBottom = targetBottomY + preferredHeight + triangleHeight < screenHeight;
    if (canBeTop && (!canBeBottom || !preferBottom)) {
      top = targetTopY - preferredHeight - triangleHeight;
      verticalPosition = 'top';
    } else if (canBeBottom) {
      top = targetBottomY + triangleHeight;
      verticalPosition = 'bottom';
    }

    // Final adjustments to ensure the popover doesn't go off-screen
    top = Math.max(0, top);

    // Assemble final position string
    const position = `${verticalPosition}-${horizontalPosition}` as TBubblePopoverPosition;

    const style = { ...this.state.style! };
    style.top = top;
    this.setState({ style, position, visible: true });
  }

  protected override renderContent(): TJSXElementChild {
    return null;
  }
}
