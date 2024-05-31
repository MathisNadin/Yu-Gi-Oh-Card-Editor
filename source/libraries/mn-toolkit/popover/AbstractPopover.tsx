import { Component, createRef } from 'react';
import { classNames } from 'mn-tools';
import { VerticalStack } from '../container';
import { JSXElementChildren } from 'mn-toolkit/react';

export interface IAbstractPopoverProps {
  key?: string;
  id?: string;
  type?: string;
  className?: string;
  targetRectangle?: DOMRect;
  height?: number;
  width?: number;
  syncHeight?: boolean;
  syncWidth?: boolean;
  content?: JSXElementChildren;
  ignoreFocus?: boolean;
}

export interface IAbstractPopoverState {
  position: string;
  style: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export abstract class AbstractPopover<
  P extends IAbstractPopoverProps = IAbstractPopoverProps,
  S extends IAbstractPopoverState = IAbstractPopoverState,
> extends Component<P, S> {
  protected popover = createRef<VerticalStack>();

  public static get defaultProps(): IAbstractPopoverProps {
    return {
      width: 300,
    };
  }

  public constructor(props: P) {
    super(props);
    this.state = {} as S;
  }

  public async setStateAsync(newState: Partial<S>) {
    return new Promise<void>((resolve) => this.setState(newState as S, resolve));
  }

  public componentDidMount() {
    this.calculatePosition();
    this.waitForAnimation()
      .then(() => setTimeout(() => this.popover.current?.containerRef.current?.focus(), 100))
      .catch((e) => app.$errorManager.trigger(e));
  }

  public async waitForAnimation() {
    return new Promise<void>((resolve) => {
      const timer = setInterval(() => {
        if (!this.state.style) return;
        clearInterval(timer);
        resolve();
      }, 100);
    });
  }

  protected abstract calculatePosition(): void;

  protected async onBlur() {
    if (this.props.ignoreFocus) return;
    await this.close();
  }

  public async close() {
    app.$device.keyboardClose();
    app.$popover.remove(this.props.id!);
  }

  public render() {
    if (!this.state.style) return null;
    return (
      <VerticalStack
        ref={this.popover}
        scroll
        style={this.state.style}
        zIndex='popover'
        tabIndex={this.props.ignoreFocus ? undefined : 100}
        onBlur={() => app.$errorManager.handlePromise(this.onBlur())}
        className={classNames('mn-abstract-popover', this.props.type, this.state.position, this.props.className)}
      >
        {this.props.content || this.renderContent()}
      </VerticalStack>
    );
  }

  protected abstract renderContent(): JSXElementChildren;
}
