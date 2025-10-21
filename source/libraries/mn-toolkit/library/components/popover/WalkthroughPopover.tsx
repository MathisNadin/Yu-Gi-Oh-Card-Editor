import { isString } from 'mn-tools';
import { TJSXElementChild } from '../../system';
import { HorizontalStack, IContainerProps } from '../container';
import { ButtonLink } from '../button';
import {
  IAbstractPopoverProps,
  IAbstractPopoverState,
  AbstractPopover,
  IAbstractPopoverStyle,
} from './AbstractPopover';

type TWalkthroughPopoverPosition = 'top' | 'bottom';

export interface IWalkthroughPopoverProps extends IAbstractPopoverProps {
  triangleWidth?: number;
  triangleHeight?: number;
  innerContent: TJSXElementChild;
  innerButtons?: {
    hint?: string;
    name?: string;
    label: string;
    onTap: () => void | Promise<void>;
  }[];
}

export interface IWalkthroughPopoverStyle extends IAbstractPopoverStyle {
  '--triangle-x': string;
  '--triangle-w': string;
  '--triangle-h': string;
}

export interface IWalkthroughPopoverState extends IAbstractPopoverState {
  position: TWalkthroughPopoverPosition;
  style?: IWalkthroughPopoverStyle;
}

export class WalkthroughPopover<
  P extends IWalkthroughPopoverProps = IWalkthroughPopoverProps,
  S extends IWalkthroughPopoverState = IWalkthroughPopoverState,
> extends AbstractPopover<P, S> {
  public static override get defaultProps(): Omit<IWalkthroughPopoverProps, 'innerContent'> {
    return {
      ...super.defaultProps,
      triangleWidth: 25,
      triangleHeight: 15,
      innerButtons: [],
    };
  }

  protected override calculatePosition() {
    let { targetElement, syncWidth, syncHeight, top, left } = this.props;
    if (!targetElement) return;

    const targetRectangle = targetElement.getBoundingClientRect();
    const targetMidX = targetRectangle.left + targetRectangle.width / 2;
    const targetTopY = targetRectangle.top;
    const targetBottomY = targetRectangle.top + targetRectangle.height;

    const { screenWidth, screenHeight } = app.$device;
    let preferredHeight: IWalkthroughPopoverStyle['height'] = syncHeight ? targetRectangle.height : this.props.height!;
    const preferredWidth = syncWidth ? targetRectangle.width : this.props.width!;
    const triangleWidth = this.props.triangleWidth! * 2; // To add some margin
    const triangleHeight = this.props.triangleHeight! * 2; // To add some margin

    // Initial guesses
    left = left || targetMidX - preferredWidth / 2;
    let position: TWalkthroughPopoverPosition = 'bottom'; // Favor top, but start with bottom for logic
    top = top || targetBottomY + triangleHeight;

    // Adjust for screen edges
    if (left! + preferredWidth + triangleWidth > screenWidth) {
      left = screenWidth - preferredWidth - triangleWidth;
    } else if (left! - triangleWidth < 0) {
      left = triangleWidth;
    }

    // Adjust vertical position based on available space
    if (targetTopY - preferredHeight - triangleHeight > 0) {
      top = targetTopY - preferredHeight - triangleHeight;
      position = 'top';
    } else if (targetBottomY + preferredHeight + triangleHeight < screenHeight) {
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

    let { targetElement, top } = this.props;
    if (!targetElement) return;

    const targetRectangle = targetElement.getBoundingClientRect();
    const targetTopY = targetRectangle.top;
    const targetBottomY = targetRectangle.top + targetRectangle.height;

    const { screenHeight } = app.$device;
    const preferredHeight = this.base.current.clientHeight;
    const triangleHeight = this.props.triangleHeight! * 2; // To add some margin

    // Initial guesses
    let position: TWalkthroughPopoverPosition = 'bottom'; // Favor top, but start with bottom for logic
    top = top || targetBottomY + triangleHeight;

    // Adjust vertical position based on available space
    if (targetTopY - preferredHeight - triangleHeight > 0) {
      top = targetTopY - preferredHeight - triangleHeight;
      position = 'top';
    } else if (targetBottomY + preferredHeight + triangleHeight < screenHeight) {
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

  protected override get contentWrapperPadding(): IContainerProps['padding'] {
    return 'small';
  }

  protected override renderContent(): TJSXElementChild {
    return [
      this.props.innerContent,
      !!this.props.innerButtons?.length && (
        <HorizontalStack key='inner-buttons' gutter itemAlignment='right' verticalItemAlignment='middle'>
          {this.props.innerButtons.map((button, i) => (
            <ButtonLink
              key={`button-${i}`}
              hint={button.hint}
              name={button.name}
              label={button.label}
              onTap={button.onTap}
            />
          ))}
        </HorizontalStack>
      ),
    ];
  }
}
