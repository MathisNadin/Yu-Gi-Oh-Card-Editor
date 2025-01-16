import { TJSXElementChild } from '../../system';
import { HorizontalStack } from '../container';
import { ButtonLink } from '../button';
import {
  IAbstractPopoverProps,
  IAbstractPopoverState,
  AbstractPopover,
  IAbstractPopoverStyle,
} from './AbstractPopover';

type TWalkthroughPopoverPosition =
  | 'top-center'
  | 'top-left'
  | 'top-right'
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right';

export interface IWalkthroughPopoverProps extends IAbstractPopoverProps {
  triangleWidth?: number;
  triangleHeight?: number;
  innerContent: TJSXElementChild;
  innerButtons?: {
    label: string;
    onTap: () => void | Promise<void>;
  }[];
}

export interface IWalkthroughPopoverState extends IAbstractPopoverState {
  position: TWalkthroughPopoverPosition;
}

export class WalkthroughPopover<
  P extends IWalkthroughPopoverProps = IWalkthroughPopoverProps,
  S extends IWalkthroughPopoverState = IWalkthroughPopoverState,
> extends AbstractPopover<P, S> {
  public static override get defaultProps(): IWalkthroughPopoverProps {
    return {
      ...super.defaultProps,
      triangleWidth: 25,
      triangleHeight: 15,
      innerButtons: [],
      innerContent: undefined,
    };
  }

  protected override calculatePosition() {
    let { targetRectangle, syncWidth, syncHeight, top, left } = this.props;
    if (!targetRectangle) return;

    const targetMidX = targetRectangle.left + targetRectangle.width / 2;
    const targetTopY = targetRectangle.top;
    const targetBottomY = targetRectangle.top + targetRectangle.height;

    const { screenWidth, screenHeight } = app.$device;
    let preferredHeight: IAbstractPopoverStyle['height'] = syncHeight ? targetRectangle.height : this.props.height!;
    const preferredWidth = syncWidth ? targetRectangle.width : this.props.width!;
    const triangleWidth = this.props.triangleWidth! * 2; // To add some margin
    const triangleHeight = this.props.triangleHeight! * 2; // To add some margin

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
    if (targetTopY - preferredHeight - triangleHeight > 0) {
      top = targetTopY - preferredHeight - triangleHeight;
      verticalPosition = 'top';
    } else if (targetBottomY + preferredHeight + triangleHeight < screenHeight) {
      top = targetBottomY + triangleHeight;
      verticalPosition = 'bottom';
    }

    // Final adjustments to ensure the popover doesn't go off-screen
    left = Math.max(0, left);
    top = Math.max(0, top);

    // Assemble final position string
    const position = `${verticalPosition}-${horizontalPosition}` as TWalkthroughPopoverPosition;

    let visible = true;
    if (!preferredHeight) {
      preferredHeight = 'fit-content';
      visible = false;
    }

    this.setState({
      style: { top, left, width: preferredWidth, height: preferredHeight },
      position,
      visible,
    });
  }

  protected override checkHeight() {
    if (this.state.style!.height !== 'fit-content' || this.state.visible || !this.base.current) {
      return;
    }

    let { targetRectangle, top } = this.props;
    if (!targetRectangle) return;

    const targetTopY = targetRectangle.top;
    const targetBottomY = targetRectangle.top + targetRectangle.height;

    const { screenHeight } = app.$device;
    const preferredHeight = this.base.current.clientHeight;
    const triangleHeight = this.props.triangleHeight! * 2; // To add some margin

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
    if (targetTopY - preferredHeight - triangleHeight > 0) {
      top = targetTopY - preferredHeight - triangleHeight;
      verticalPosition = 'top';
    } else if (targetBottomY + preferredHeight + triangleHeight < screenHeight) {
      top = targetBottomY + triangleHeight;
      verticalPosition = 'bottom';
    }

    // Final adjustments to ensure the popover doesn't go off-screen
    top = Math.max(0, top);

    // Assemble final position string
    const position = `${verticalPosition}-${horizontalPosition}` as TWalkthroughPopoverPosition;

    const style = { ...this.state.style! };
    style.top = top;
    this.setState({ style, position, visible: true });
  }

  protected override renderContent(): TJSXElementChild {
    return [
      this.props.innerContent,
      !!this.props.innerButtons?.length && (
        <HorizontalStack key='inner-buttons' gutter itemAlignment='right' verticalItemAlignment='middle'>
          {this.props.innerButtons.map((button, i) => (
            <ButtonLink key={`button-${i}`} label={button.label} onTap={button.onTap} />
          ))}
        </HorizontalStack>
      ),
    ];
  }
}
