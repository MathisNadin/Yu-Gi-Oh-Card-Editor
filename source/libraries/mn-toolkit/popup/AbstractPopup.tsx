import { Component } from 'react';
import { classNames } from 'mn-tools';
import { JSXElementChildren } from '../react';
import { HorizontalStack, VerticalStack } from '../container';
import { Button, IButtonProps } from '../button';
import { Spacer } from '../spacer';
import { Spinner } from '../spinner';
import { Typography } from '../typography';
import { Icon } from '../icon';

export interface IAbstractPopupProps<R> {
  key?: string;
  id?: string;
  type?: string;
  className?: string;
  title?: string;
  height?: string;
  width?: string;
  onClose?: (R?: R) => void;
}

export interface IAbstractPopupState {
  loaded: boolean;
  hidding: boolean;
  buttons: IButtonProps[];
}

export abstract class AbstractPopup<
  R,
  P extends IAbstractPopupProps<R> = IAbstractPopupProps<R>,
  S extends IAbstractPopupState = IAbstractPopupState,
> extends Component<P, S> {
  protected onInitializePopup?: () => Promise<void>;

  public constructor(props: P) {
    super(props);
    const buttons: IButtonProps[] = [];
    this.state = { loaded: false, hidding: false, buttons } as S;
  }

  public async setStateAsync(newState: Partial<S>) {
    return new Promise<void>((resolve) => this.setState(newState as S, resolve));
  }

  public componentDidMount() {
    if (this.onInitializePopup) {
      this.onInitializePopup()
        .then(() => this.setState({ loaded: true }))
        .catch((e: Error) => app.$errorManager.trigger(e));
    }
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
        className={classNames('mn-abstract-popup', this.props.type, this.props.className, {
          hidding: this.state.hidding,
        })}
        style={{
          height: this.props.height!,
          minHeight: this.props.height!,
          maxHeight: this.props.height!,
          width: this.props.width!,
          minWidth: this.props.width!,
          maxWidth: this.props.width!,
        }}
      >
        {!this.state.loaded && <Spinner />}

        {this.state.loaded && this.renderHeader()}

        {this.state.loaded && (
          <VerticalStack fill scroll className='mn-popup-content-container'>
            {this.renderContent()}
          </VerticalStack>
        )}

        {this.state.loaded && this.renderFooter()}
      </VerticalStack>
    );
  }

  protected renderHeader() {
    return (
      <HorizontalStack className='mn-popup-header' key='header'>
        <Typography bold variant='label' contentType='text' content={this.props.title} />
        <Spacer />
        <Icon iconId='toolkit-close' onTap={() => this.close(undefined)} />
      </HorizontalStack>
    );
  }

  protected abstract renderContent(): JSXElementChildren;

  protected renderFooter() {
    return (
      <HorizontalStack className='mn-popup-footer' key='footer' gutter itemAlignment='right'>
        {this.state.buttons.map((props, i) => (
          <Button {...props} key={`popup-footer-button-${i}`} />
        ))}
      </HorizontalStack>
    );
  }
}
