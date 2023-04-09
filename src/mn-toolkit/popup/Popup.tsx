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

interface PopupProps extends IContainerProps {
  title: string;
  content: ReactElement;
  innerHeight?: string| number;
  innerWidth?: string| number;
  onClosePopup: () => void;
}

interface PopupState extends IContainerState {
}

export class Popup extends Container<PopupProps, PopupState> {

  public constructor(props: PopupProps) {
    super(props);

    this.state = {
      loaded: true,
    };
  }

  public onClosePopup() {
    if (this.props.onClosePopup) this.props.onClosePopup();
  }

  public render() {
    return this.renderAttributes(<VerticalStack>
      <VerticalStack className='mn-popup-inner' height={this.props.innerHeight} width={this.props.innerWidth} >
        <HorizontalStack className='mn-popup-header'>
          <p className='mn-popup-title'>{this.props.title}</p>
          <img className='mn-popup-close' src={cross} alt='cross' onClick={() => this.onClosePopup()} />
        </HorizontalStack>
        {this.props.content}
      </VerticalStack>
    </VerticalStack>, 'mn-popup');
  }
}
