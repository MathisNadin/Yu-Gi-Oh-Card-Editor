import { TJSXElementChild, TJSXElementChildren, IDeviceListener, IScreenSpec } from '../../system';
import { IContainerProps, IContainerState, Container, HorizontalStack, VerticalStack } from '../container';
import { Button, IButtonProps } from '../button';
import { Spacer } from '../spacer';
import { Spinner } from '../spinner';
import { Typography } from '../typography';
import { Icon } from '../icon';

export interface IAbstractPopupProps<R> extends IContainerProps {
  key?: string;
  type?: string;
  title?: string;
  onRef?: (ref: AbstractPopup<R>) => void;
  onClose?: (R?: R) => void;
}

export interface IAbstractPopupState extends IContainerState {
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
  extends Container<P, S>
  implements Partial<IDeviceListener>
{
  protected onInitializePopup?(): Promise<void>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static override get defaultProps(): IAbstractPopupProps<any> {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      gutter: true,
      padding: true,
      bg: '1',
      zIndex: 'popup',
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

  public override componentDidMount() {
    super.componentDidMount();
    app.$errorManager.handlePromise(this.initialize());
  }

  protected async initialize() {
    if (this.onInitializePopup) await this.onInitializePopup();
    await this.setStateAsync({ loaded: true });
    await this.checkSize();
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    app.$device.removeListener(this);
  }

  public deviceScreenSpecificationChanged(_newSpec: IScreenSpec, _oldSpec: IScreenSpec) {
    app.$errorManager.handlePromise(this.checkSize());
  }

  protected async checkSize() {
    if (!this.base.current?.clientHeight) {
      return await this.setStateAsync({ active: true });
    }

    let { height, width } = this.state;
    const { screenHeight, screenWidth } = app.$device;
    const popupHeight = this.base.current.clientHeight;
    const popupWidth = this.base.current.clientWidth;

    if (screenHeight < popupHeight) {
      height = '100%';
    }
    if (screenWidth < popupWidth) {
      width = '100%';
    }

    await this.setStateAsync({ active: true, height, width });
  }

  public async close(R?: R) {
    app.$device.keyboardClose();
    await this.setStateAsync({ hidding: true });
    setTimeout(() => {
      app.$popup.remove(this.props.id!);
      if (this.props.onClose) this.props.onClose(R!);
    }, 200);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-popup'] = true;
    if (this.props.type) classes[this.props.type] = true;
    classes['active'] = this.state.active;
    classes['hidding'] = this.state.hidding;
    return classes;
  }

  public override renderStyle() {
    const style = super.renderStyle();
    style.height = this.state.height;
    style.width = this.state.width;
    return style;
  }

  public override get children() {
    return [
      !this.state.loaded && <Spinner key='unloaded-spinner' />,

      this.state.loaded && this.renderHeader(),

      this.state.loaded && (
        <VerticalStack
          key='mn-popup-content-container'
          className='mn-popup-content-container'
          gutter
          fill={this.state.active}
          scroll={this.scrollInContent}
        >
          {this.renderContent()}
        </VerticalStack>
      ),

      this.state.loaded && this.renderFooter(),
    ];
  }

  protected get scrollInContent() {
    return this.state.height === '100%';
  }

  protected renderHeader(): TJSXElementChild {
    return (
      <HorizontalStack key='header' className='mn-popup-header'>
        <Typography
          className='mn-popup-title'
          bold
          fontSize='medium'
          variant='label'
          contentType='text'
          content={this.props.title}
        />
        <Spacer />
        <Icon icon='toolkit-close' onTap={() => this.close(undefined)} />
      </HorizontalStack>
    );
  }

  protected abstract renderContent(): TJSXElementChildren;

  protected get buttons(): IButtonProps[] {
    return this.state.buttons;
  }

  protected renderFooter() {
    const buttons = this.buttons;
    if (!buttons.length) return null;
    return (
      <HorizontalStack key='footer' className='mn-popup-footer' gutter itemAlignment='right'>
        {buttons.map((props, i) => (
          <Button {...props} key={`popup-footer-button-${i}`} />
        ))}
      </HorizontalStack>
    );
  }
}
