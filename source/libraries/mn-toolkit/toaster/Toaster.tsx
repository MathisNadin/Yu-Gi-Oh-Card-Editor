import { Component } from 'react';
import { classNames } from 'mn-tools';
import { HorizontalStack } from '../container';
import { Icon } from '../icon';
import { Typography } from '../typography';
import { TBackgroundColor } from '../themeSettings';
import { TToastType } from '.';

const TIMEOUT = 5000;

export interface IToasterProps {
  key: string;
  id: string;
  message: string;
  type: TToastType;
}

export interface IToasterState {
  bg: TBackgroundColor;
  visible: boolean;
  hidding: boolean;
}

export class Toaster<
  P extends IToasterProps = IToasterProps,
  S extends IToasterState = IToasterState,
> extends Component<P, S> {
  private timeout!: NodeJS.Timeout;

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
    this.state = { bg, hidding: false } as S;
  }

  public async setStateAsync(newState: Partial<S>) {
    return new Promise<void>((resolve) => this.setState(newState as S, resolve));
  }

  public override componentDidMount() {
    if (super.componentDidMount) super.componentDidMount();
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
    await this.setStateAsync({ hidding: true } as Partial<S>);
    setTimeout(() => {
      app.$toaster.remove(this.props.id!);
    }, 200);
  }

  public render() {
    return (
      <HorizontalStack
        gutter
        bg={this.state.bg}
        zIndex='toaster'
        verticalItemAlignment='middle'
        className={classNames('mn-toaster', { visible: this.state.visible, hidding: this.state.hidding })}
      >
        <Typography fill color='4' content={this.props.message} contentType='text' />
        <Icon icon='toolkit-close' color='4' onTap={() => this.close()} />
      </HorizontalStack>
    );
  }
}
