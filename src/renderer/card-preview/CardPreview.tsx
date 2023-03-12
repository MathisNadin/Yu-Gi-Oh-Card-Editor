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
import './styles.css';
import { Container, IContainerProps, IContainerState } from 'mn-toolkit/container/Container';

interface ICardPreviewProps extends IContainerProps {
}

interface ICardPreviewState extends IContainerState {
}

export class CardPreview extends Container {

  public constructor(props: ICardPreviewProps) {
    super(props);
  }

  public static defaultProps: Partial<ICardPreviewProps> = {
  }

  public render() {
    return this.renderAttributes(<div>
    </div>, 'card-preview');
  }
};
