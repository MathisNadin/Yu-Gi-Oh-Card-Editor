/* eslint-disable import/no-dynamic-require */
/* eslint-disable lines-between-class-members */
/* eslint-disable global-require */
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
import { Container } from 'mn-toolkit/container/Container';
import { ICard } from 'renderer/card-handler/ICard';

/* const contour = require('../resources/pictures/Contour [Bords Carrés].png');
const frame = require('../resources/pictures/card frames/Monstre à Effet.png'); */

interface ICardPreviewProps extends IContainableProps {
  card: ICard;
}

interface ICardPreviewState extends IContainableState {
  contour: string;
  cardFrame: string;
  level: string;
}

export class CardPreview extends Containable<ICardPreviewProps, ICardPreviewState> {

  private picturesImageSourceURL = "../resources/pictures/";
  private fontsSourceURL = "../resources/fonts/";

  public constructor(props: ICardPreviewProps) {
    super(props);

    this.state = {
      loaded: true,
      contour: require(`${this.picturesImageSourceURL}Contour [Bords Carrés].png`),
      cardFrame: require(`${this.picturesImageSourceURL}card frames/${props.card.frame}.png`),
      level: require(`${this.picturesImageSourceURL}levels/${props.card.level}.png`)
    };
  }

  public static getDerivedStateFromProps(nextProps: ICardPreviewProps, prevState: ICardPreviewState) {
    return {
      cardFrame: require(`../resources/pictures/card frames/${nextProps.card.frame}.png`),
      level: require(`../resources/pictures/levels/${nextProps.card.level}.png`)
    };
  }

  public render() {
    return this.renderAttributes(<Container>
      <img className='card-template contour' src={this.state.contour} alt='contour' />
      <img className='card-template card-frame' src={this.state.cardFrame} alt='card frame' />
      <img className='card-template card-frame' src={this.state.level} alt='level' />
    </Container>, 'card-preview');
  }
}
