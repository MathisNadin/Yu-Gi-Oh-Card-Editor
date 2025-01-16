import { TBackgroundColor } from '../../system';
import { Container, IContainerProps, IContainerState } from '../container';
import { Icon } from '../icon';
import { Typography } from '../typography';
import { TToastType } from '.';

const TIMEOUT = 5000;

export interface IToasterProps extends IContainerProps {
  key: string;
  id: string;
  message: string;
  type: TToastType;
}

export interface IToasterState extends IContainerState {
  bg: TBackgroundColor;
  visible: boolean;
  hidding: boolean;
}

export class Toaster<
  P extends IToasterProps = IToasterProps,
  S extends IToasterState = IToasterState,
> extends Container<P, S> {
  private timeout!: NodeJS.Timeout;

  public static override get defaultProps(): IToasterProps {
    return {
      ...super.defaultProps,
      bg: undefined,
      layout: 'horizontal',
      gutter: true,
      zIndex: 'toaster',
      verticalItemAlignment: 'middle',
      key: undefined!,
      message: '',
      type: undefined!,
      id: undefined!,
    };
  }

  public constructor(props: P) {
    super(props);

    let bg: TBackgroundColor;
    switch (props.type) {
      case 'info':
        bg = 'info';
        break;

      case 'success':
        bg = 'positive';
        break;

      case 'warning':
        bg = 'warning';
        break;

      case 'error':
        bg = 'negative';
        break;

      default:
        bg = 'neutral';
        break;
    }
    this.state = { ...this.state, bg, hidding: false };
  }

  public override componentDidMount() {
    super.componentDidMount();
    setTimeout(() => {
      this.setState({ visible: true }, () => {
        if (this.props.type === 'error') return;
        this.timeout = setTimeout(() => this.close(), TIMEOUT);
      });
    }, 200);
  }

  public async close() {
    if (this.timeout) clearTimeout(this.timeout);
    app.$device.keyboardClose();
    await this.setStateAsync({ hidding: true });
    setTimeout(() => {
      app.$toaster.remove(this.props.id!);
    }, 200);
  }

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    return attributes;
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-toaster'] = true;
    classes['visible'] = this.state.visible;
    classes['hidding'] = this.state.hidding;
    if (this.state.bg) classes[`mn-bg-${this.state.bg}`] = true;
    return classes;
  }

  public override get children() {
    return [
      <Typography key='message' fill content={this.props.message} contentType='text' />,
      <Icon key='close-icon' icon='toolkit-close' onTap={() => this.close()} />,
    ];
  }
}
