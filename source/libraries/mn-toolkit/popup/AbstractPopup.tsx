import { Component, createRef } from 'react';
import { classNames } from 'mn-tools';
import { JSXElementChild, JSXElementChildren } from '../react';
import { HorizontalStack, VerticalStack } from '../container';
import { Button, IButtonProps } from '../button';
import { Spacer } from '../spacer';
import { Spinner } from '../spinner';
import { Typography } from '../typography';
import { Icon } from '../icon';
import { IDeviceListener, IScreenSpec } from '../device';

export interface IAbstractPopupProps<R> {
  key?: string;
  id?: string;
  type?: string;
  className?: string;
  title?: string;
  height?: string;
  width?: string;
  onRef?: (ref: AbstractPopup<R>) => void;
  onClose?: (R?: R) => void;
}

export interface IAbstractPopupState {
  loaded: boolean;
  active: boolean;
  hidding: boolean;
  buttons: IButtonProps[];
  height: string;
  width: string;
}

export abstract class AbstractPopup<
    R,
    P extends IAbstractPopupProps<R> = IAbstractPopupProps<R>,
    S extends IAbstractPopupState = IAbstractPopupState,
  >
  extends Component<P, S>
  implements Partial<IDeviceListener>
{
  protected popup = createRef<VerticalStack>();
  protected onInitializePopup?(): Promise<void>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static get defaultProps(): Partial<IAbstractPopupProps<any>> {
    return {
      className: '',
      title: '',
    };
  }

  public constructor(props: P) {
    super(props);
    app.$device.addListener(this);
    const buttons: IButtonProps[] = [];
    this.state = {
      loaded: false,
      active: false,
      hidding: false,
      buttons,
      height: this.props.height,
      width: this.props.width || (app.$device.isSmallScreen ? '100%' : '80%'),
    } as S;
  }

  public async forceUpdateAsync() {
    return new Promise<void>((resolve) => this.forceUpdate(resolve));
  }

  public async setStateAsync(newState: Partial<S>) {
    return new Promise<void>((resolve) => this.setState(newState as S, resolve));
  }

  public override componentDidMount() {
    if (super.componentDidMount) super.componentDidMount();
    app.$errorManager.handlePromise(this.initialize());
  }

  protected async initialize() {
    if (this.onInitializePopup) await this.onInitializePopup();
    await this.setStateAsync({ loaded: true } as Partial<S>);
    await this.checkSize();
  }

  public override componentWillUnmount() {
    if (super.componentWillUnmount) super.componentWillUnmount();
    app.$device.removeListener(this);
  }

  public deviceScreenSpecificationChanged(_newSpec: IScreenSpec) {
    app.$errorManager.handlePromise(this.checkSize());
  }

  protected async checkSize() {
    if (!this.popup?.current?.base?.current?.clientHeight) {
      return await this.setStateAsync({ active: true } as Partial<S>);
    }

    let { height, width } = this.state;
    const { screenHeight, screenWidth } = app.$device;
    const popupHeight = this.popup.current.base.current.clientHeight;
    const popupWidth = this.popup.current.base.current.clientWidth;

    if (screenHeight < popupHeight) {
      height = '100%';
    }
    if (screenWidth < popupWidth) {
      width = '100%';
    }

    await this.setStateAsync({ active: true, height, width } as Partial<S>);
  }

  public async close(R?: R) {
    app.$device.keyboardClose();
    await this.setStateAsync({ hidding: true } as Partial<S>);
    setTimeout(() => {
      app.$popup.remove(this.props.id!);
      if (this.props.onClose) this.props.onClose(R!);
    }, 200);
  }

  public render() {
    return (
      <VerticalStack
        gutter
        padding
        bg='1'
        zIndex='popup'
        ref={this.popup}
        className={classNames('mn-popup', this.props.type, this.props.className, {
          active: this.state.active,
          hidding: this.state.hidding,
        })}
        style={{
          height: this.state.height,
          width: this.state.width,
        }}
      >
        {!this.state.loaded && <Spinner />}

        {this.state.loaded && this.renderHeader()}

        {this.state.loaded && (
          <VerticalStack
            className='mn-popup-content-container'
            gutter
            fill={this.state.active}
            scroll={this.scrollInContent}
          >
            {this.renderContent()}
          </VerticalStack>
        )}

        {this.state.loaded && this.renderFooter()}
      </VerticalStack>
    );
  }

  protected get scrollInContent() {
    return this.state.height === '100%';
  }

  protected renderHeader(): JSXElementChild {
    return (
      <HorizontalStack className='mn-popup-header' key='header'>
        <Typography className='mn-popup-title' bold variant='label' contentType='text' content={this.props.title} />
        <Spacer />
        <Icon icon='toolkit-close' onTap={() => this.close(undefined)} />
      </HorizontalStack>
    );
  }

  protected abstract renderContent(): JSXElementChildren;

  protected get buttons(): IButtonProps[] {
    return this.state.buttons;
  }

  protected renderFooter() {
    const buttons = this.buttons;
    if (!buttons.length) return null;
    return (
      <HorizontalStack className='mn-popup-footer' key='footer' gutter itemAlignment='right'>
        {buttons.map((props, i) => (
          <Button {...props} key={`popup-footer-button-${i}`} />
        ))}
      </HorizontalStack>
    );
  }
}
