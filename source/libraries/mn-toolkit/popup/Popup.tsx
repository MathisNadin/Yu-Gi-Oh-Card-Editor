import {
  IContainerProps,
  IContainerState,
  Container,
  HorizontalStack,
  VerticalStack,
} from 'libraries/mn-toolkit/container';
import { ReactElement } from 'react';
import { Icon } from '../icon';
import { Typography } from '../typography';

export interface IPopupProps extends IContainerProps {
  type?: string;
  id: string;
  title: string;
  content: ReactElement;
  innerHeight?: string;
  innerWidth?: string;
}

interface IPopupState extends IContainerState {}

export class Popup<RESULT> extends Container<IPopupProps, IPopupState> {
  private resolve: (result: RESULT) => void = undefined as unknown as (result: RESULT) => void;

  public constructor(props: IPopupProps, resolve: (result: RESULT) => void) {
    super(props);
    this.resolve = resolve;

    this.state = {
      loaded: true,
    };
  }

  public close(result?: RESULT) {
    app.$popup.remove(this.props.id);
    if (this.resolve) this.resolve(result as RESULT);
  }

  public render() {
    return this.renderAttributes(
      <VerticalStack>
        <VerticalStack className='mn-popup-inner' height={this.props.innerHeight} width={this.props.innerWidth}>
          <HorizontalStack className='mn-popup-header'>
            <Typography className='mn-popup-title' content={this.props.title} variant='h6' />
            <Icon className='mn-popup-close' iconId='toolkit-close' size={24} color='1' onTap={() => this.close()} />
          </HorizontalStack>
          {this.renderAttributes(this.props.content, 'mn-popup-content')}
        </VerticalStack>
      </VerticalStack>,
      'mn-popup'
    );
  }
}
