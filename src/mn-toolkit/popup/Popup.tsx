/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
/* eslint-disable react/self-closing-comp */
/* eslint-disable no-unused-vars */
/* eslint-disable no-return-assign */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */
import { IContainerProps, IContainerState, Container } from 'mn-toolkit/container/Container';
import { HorizontalStack } from 'mn-toolkit/container/HorizontalStack';
import { VerticalStack } from 'mn-toolkit/container/VerticalStack';
import { ReactElement } from 'react';
import cross from '../assets/cross.svg';
import './styles.css';

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
          <img className='mn-popup-close' src={cross} alt='cross' onClick={() => this.close()} />
        </HorizontalStack>
        {this.renderAttributes(this.props.content, 'mn-popup-content')}
      </VerticalStack>
    </VerticalStack>, 'mn-popup');
  }
}
