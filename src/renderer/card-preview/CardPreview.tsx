/* eslint-disable class-methods-use-this */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react/default-props-match-prop-types */
/* eslint-disable react/sort-comp */
/* eslint-disable react/static-property-placement */
/* eslint-disable no-use-before-define */
/* eslint-disable react/require-default-props */
/* eslint-disable no-useless-constructor */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable import/prefer-default-export */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { IContainableProps, IContainableState, Containable } from 'mn-toolkit/containable/Containable';
import './styles.css';

interface ICardPreviewProps extends IContainableProps {
}

interface ICardPreviewState extends IContainableState {
}

export class CardPreview extends Containable<ICardPreviewProps, ICardPreviewState> {

  public render() {
    return this.renderAttributes(<div>
      <img className='card-template' src='/assets/pictures/Contour [Bords Carrés]' alt='contour' />
      <img className='card-template' src='/assets/pictures/Obelisk' alt='contour' />
    </div>, 'card-preview');
  }
};
