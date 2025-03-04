import { isNumber } from 'mn-tools';
import { TJSXElementChild, TJSXElementChildren } from '../../system';
import { IContainerProps, IContainerState, Container, VerticalStack } from '../container';

export interface IAbstractPopoverProps extends IContainerProps {
  key?: string;
  type?: string;
  overlay?: boolean;
  focus?: boolean;
  targetRectangle?: DOMRect;
  height?: number;
  width?: number;
  top?: number;
  left?: number;
  syncHeight?: boolean;
  syncWidth?: boolean;
  content?: TJSXElementChildren;
  ignoreFocus?: boolean;
  onClose?: (onBlur?: boolean) => void | Promise<void>;
}

export interface IAbstractPopoverStyle {
  top: number;
  left: number;
  width: number;
  height: number | 'fit-content';
}

export interface IAbstractPopoverState extends IContainerState {
  visible: boolean;
  position: string;
  style?: IAbstractPopoverStyle;
}

export abstract class AbstractPopover<
  P extends IAbstractPopoverProps = IAbstractPopoverProps,
  S extends IAbstractPopoverState = IAbstractPopoverState,
> extends Container<P, S> {
  public static override get defaultProps(): IAbstractPopoverProps {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      zIndex: 'popover',
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

  protected abstract calculatePosition(): void;
  protected abstract checkHeight(): void;

  public override componentDidMount() {
    super.componentDidMount();

    this.calculatePosition();

    this.waitForStyle()
      .then(() => setTimeout(() => this.checkHeight(), 100))
      .catch((e) => app.$errorManager.trigger(e));

    this.waitForVisible()
      .then(() => setTimeout(() => this.base.current?.focus(), 100))
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

  protected async onBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (this.props.onBlur) await this.props.onBlur(event);

    if (this.props.ignoreFocus) return;

    // Check if the related target is inside the popover
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    if (relatedTarget && this.base.current?.contains(relatedTarget)) {
      // If not an anchor, don't close here, let the component clicked on handle it
      if (relatedTarget.tagName !== 'A') return;
      const safeClose = () => {
        app.$errorManager.handlePromise(this.close());
        relatedTarget.removeEventListener('click', safeClose);
      };
      relatedTarget.addEventListener('click', safeClose);
    } else {
      await this.close();
    }
  }

  public async close() {
    app.$device.keyboardClose();
    app.$popover.remove(this.props.id!);
    if (this.props.onClose) await this.props.onClose();
  }

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    attributes.tabIndex = this.props.ignoreFocus ? undefined : 0;
    attributes.onBlur = (e) => app.$errorManager.handlePromise(this.onBlur(e));
    return attributes;
  }

  public override renderStyle() {
    const style = super.renderStyle();
    if (this.state.style) {
      style.top = this.state.style.top;
      style.left = this.state.style.left;
      style.width = this.state.style.width;
      style.height = this.state.style.height;
    }
    return style;
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-popover'] = true;
    if (this.props.type) classes[this.props.type] = true;
    classes[this.state.position] = true;
    classes['visible'] = this.state.visible;
    return classes;
  }

  public override render(): TJSXElementChild {
    if (!this.state.style) return null;
    return super.render();
  }

  public override get children() {
    return (
      <VerticalStack
        key='popover-content-wrapper'
        className='popover-content-wrapper'
        scroll={isNumber(this.state.style!.height)}
        gutter
      >
        {this.props.content || this.renderContent()}
      </VerticalStack>
    );
  }

  protected abstract renderContent(): TJSXElementChildren;
}
