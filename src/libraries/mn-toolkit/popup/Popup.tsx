import './styles.scss';
import { IContainerProps, IContainerState, Container } from 'libraries/mn-toolkit/container/Container';
import { HorizontalStack } from 'libraries/mn-toolkit/container/HorizontalStack';
import { VerticalStack } from 'libraries/mn-toolkit/container/VerticalStack';
import { ReactElement } from 'react';
import { Icon } from '../icon';

export interface IPopupProps extends IContainerProps {
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
    return this.renderAttributes(<VerticalStack>
      <VerticalStack className='mn-popup-inner' height={this.props.innerHeight} width={this.props.innerWidth} >
        <HorizontalStack className='mn-popup-header'>
          <p className='mn-popup-title'>{this.props.title}</p>
          <Icon className='mn-popup-close' iconId='toolkit-close' onTap={() => this.close()} />
          {/* <img className='mn-popup-close' src={crossIcon as string} alt='cross' onClick={() => this.close()} /> */}
        </HorizontalStack>
        {this.renderAttributes(this.props.content, 'mn-popup-content')}
      </VerticalStack>
    </VerticalStack>, 'mn-popup');
  }
}
