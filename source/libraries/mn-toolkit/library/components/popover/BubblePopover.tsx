import { isString } from 'mn-tools';
import { TJSXElementChild } from '../../system';
import {
  IAbstractPopoverProps,
  IAbstractPopoverState,
  AbstractPopover,
  IAbstractPopoverStyle,
} from './AbstractPopover';

type TBubblePopoverPosition = 'top' | 'bottom';

export interface IBubblePopoverProps extends IAbstractPopoverProps {
  triangleWidth?: number;
  triangleHeight?: number;
  preferBottom?: boolean;
}

export interface IBubblePopoverStyle extends IAbstractPopoverStyle {
  '--triangle-x': string;
  '--triangle-w': string;
  '--triangle-h': string;
}

export interface IBubblePopoverState extends IAbstractPopoverState {
  position: TBubblePopoverPosition;
  style?: IBubblePopoverStyle;
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
    let { targetElement, syncWidth, syncHeight, top, left, preferBottom } = this.props;
    if (!targetElement) return;

    const targetRectangle = targetElement.getBoundingClientRect();
    const targetMidX = targetRectangle.left + targetRectangle.width / 2;
    const targetTopY = targetRectangle.top;
    const targetBottomY = targetRectangle.top + targetRectangle.height;

    const { screenWidth, screenHeight } = app.$device;
    let preferredHeight: IBubblePopoverStyle['height'] = syncHeight ? targetRectangle.height : this.props.height!;
    const preferredWidth = syncWidth ? targetRectangle.width : this.props.width!;
    const triangleWidth = this.props.triangleWidth! * 1.5; // To add some margin
    const triangleHeight = this.props.triangleHeight! * 1.5; // To add some margin

    // Initial guesses
    left = left || targetMidX - preferredWidth / 2;
    let position: TBubblePopoverPosition = 'bottom'; // Favor top, but start with bottom for logic
    top = top || targetBottomY + triangleHeight;

    // Adjust for screen edges
    if (left! + preferredWidth + triangleWidth > screenWidth) {
      left = screenWidth - preferredWidth - triangleWidth;
    } else if (left! - triangleWidth < 0) {
      left = triangleWidth;
    }

    // Adjust vertical position based on available space
    const canBeTop = targetTopY - preferredHeight - triangleHeight > 0;
    const canBeBottom = targetBottomY + preferredHeight + triangleHeight < screenHeight;
    if (canBeTop && (!canBeBottom || !preferBottom)) {
      top = targetTopY - preferredHeight - triangleHeight;
      position = 'top';
    } else if (canBeBottom) {
      top = targetBottomY + triangleHeight;
      position = 'bottom';
    }

    // Final adjustments to ensure the popover doesn't go off-screen
    left = Math.max(0, left);
    top = Math.max(0, top);

    let visible = true;
    if (!preferredHeight) {
      preferredHeight = 'auto';
      visible = this.state.visible; // If already visible, don't make it disapear and reappear again
    }

    const triangleHalf = this.props.triangleWidth! / 2;
    // Horizontal position (relative to the popover) that the arrow should aim at
    let triangleX = targetMidX - left!; // center of the target in the popover marker
    triangleX = Math.max(
      triangleHalf, // prevent the arrow from leaving the frame
      Math.min(preferredWidth - triangleHalf, triangleX)
    );

    this.setState(
      {
        style: {
          top,
          left,
          width: Math.max(preferredWidth, 0),
          height: isString(preferredHeight) ? preferredHeight : Math.max(preferredHeight, 0),
          '--triangle-x': `${triangleX}px`,
          '--triangle-w': `${this.props.triangleWidth}px`,
          '--triangle-h': `${this.props.triangleHeight}px`,
        },
        position,
        visible,
      },
      () => this.checkHeight()
    );
  }

  protected checkHeight() {
    if (this.state.style!.height !== 'auto' || !this.base.current) {
      return;
    }

    let { targetElement, top, preferBottom } = this.props;
    if (!targetElement) return;

    const targetRectangle = targetElement.getBoundingClientRect();
    const targetTopY = targetRectangle.top;
    const targetBottomY = targetRectangle.top + targetRectangle.height;

    const { screenHeight } = app.$device;
    const preferredHeight = this.base.current.clientHeight;
    const triangleHeight = this.props.triangleHeight! * 1.5; // To add some margin

    // Initial guesses
    let position: TBubblePopoverPosition = 'bottom'; // Favor top, but start with bottom for logic
    top = top || targetBottomY + triangleHeight;

    // Adjust vertical position based on available space
    const canBeTop = targetTopY - preferredHeight - triangleHeight > 0;
    const canBeBottom = targetBottomY + preferredHeight + triangleHeight < screenHeight;
    if (canBeTop && (!canBeBottom || !preferBottom)) {
      top = targetTopY - preferredHeight - triangleHeight;
      position = 'top';
    } else if (canBeBottom) {
      top = targetBottomY + triangleHeight;
      position = 'bottom';
    }

    const style = { ...this.state.style! };
    style.top = top;
    this.setState({ style, position, visible: true });
  }

  public override renderStyle() {
    const style = super.renderStyle();
    if (this.state.style) {
      style['--triangle-h'] = this.state.style['--triangle-h'];
      style['--triangle-w'] = this.state.style['--triangle-w'];
      style['--triangle-x'] = this.state.style['--triangle-x'];
    }
    return style;
  }

  protected override renderContent(): TJSXElementChild {
    return null;
  }
}
