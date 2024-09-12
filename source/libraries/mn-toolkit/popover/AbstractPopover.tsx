import { Component, createRef } from 'react';
import { classNames, isNumber } from 'mn-tools';
import { VerticalStack } from '../container';
import { JSXElementChildren } from '../react';
import { TBackgroundColor } from '../themeSettings';

export interface IAbstractPopoverProps {
  key?: string;
  id?: string;
  type?: string;
  overlay?: boolean;
  focus?: boolean;
  className?: string;
  targetRectangle?: DOMRect;
  height?: number;
  width?: number;
  top?: number;
  left?: number;
  syncHeight?: boolean;
  syncWidth?: boolean;
  content?: JSXElementChildren;
  ignoreFocus?: boolean;
  bg?: TBackgroundColor;
  onBlurClose?: (event: React.FocusEvent) => void | Promise<void>;
}

export interface IAbstractPopoverState {
  visible: boolean;
  position: string;
  style: {
    top: number;
    left: number;
    width: number;
    height: number | 'fit-content';
  };
}

export abstract class AbstractPopover<
  P extends IAbstractPopoverProps = IAbstractPopoverProps,
  S extends IAbstractPopoverState = IAbstractPopoverState,
> extends Component<P, S> {
  protected popover = createRef<VerticalStack>();

  public static get defaultProps(): IAbstractPopoverProps {
    return {
      bg: '1',
      top: 0,
      left: 0,
      height: 0,
      width: 300,
    };
  }

  public constructor(props: P) {
    super(props);
    this.state = {} as S;
  }

  public async forceUpdateAsync() {
    return new Promise<void>((resolve) => this.forceUpdate(resolve));
  }

  public async setStateAsync(newState: Partial<S>) {
    return new Promise<void>((resolve) => this.setState(newState as S, resolve));
  }

  protected abstract calculatePosition(): void;
  protected abstract checkHeight(): void;

  public override componentDidMount() {
    if (super.componentDidMount) super.componentDidMount();

    this.calculatePosition();

    this.waitForStyle()
      .then(() => setTimeout(() => this.checkHeight(), 100))
      .catch((e) => app.$errorManager.trigger(e));

    this.waitForVisible()
      .then(() => setTimeout(() => this.popover.current?.base?.current?.focus(), 100))
      .catch((e) => app.$errorManager.trigger(e));
  }

  public async waitForStyle() {
    return await new Promise<void>((resolve) => {
      const timer = setInterval(() => {
        if (!this.state.style) return;
        clearInterval(timer);
        resolve();
      }, 100);
    });
  }

  public async waitForVisible() {
    return await new Promise<void>((resolve) => {
      const timer = setInterval(() => {
        if (!this.state.visible) return;
        clearInterval(timer);
        resolve();
      }, 100);
    });
  }

  protected async onBlur(event: React.FocusEvent) {
    if (this.props.ignoreFocus) return;

    const close = async () => {
      await this.close();
      if (this.props.onBlurClose) await this.props.onBlurClose(event);
    };

    // Check if the related target is inside the popover
    const currentTarget = event.currentTarget;
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    if (relatedTarget && currentTarget.contains(relatedTarget)) {
      if (relatedTarget.tagName !== 'A') return;
      const safeClose = () => {
        app.$errorManager.handlePromise(close());
        relatedTarget.removeEventListener('click', safeClose);
      };
      relatedTarget.addEventListener('click', safeClose);
    } else {
      await close();
    }
  }

  public async close() {
    app.$device.keyboardClose();
    app.$popover.remove(this.props.id!);
  }

  public override render() {
    if (!this.state.style) return null;
    return (
      <VerticalStack
        ref={this.popover}
        style={this.state.style}
        zIndex='popover'
        bg={this.props.bg}
        tabIndex={this.props.ignoreFocus ? undefined : 100}
        onBlur={(e) => app.$errorManager.handlePromise(this.onBlur(e))}
        className={classNames('mn-popover', this.props.type, this.state.position, this.props.className, {
          visible: this.state.visible,
        })}
      >
        <VerticalStack className='popover-content-wrapper' scroll={isNumber(this.state.style.height)} gutter>
          {this.props.content || this.renderContent()}
        </VerticalStack>
      </VerticalStack>
    );
  }

  protected abstract renderContent(): JSXElementChildren;
}
