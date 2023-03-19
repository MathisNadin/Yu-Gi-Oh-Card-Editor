/* eslint-disable react/no-array-index-key */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-const */
/* eslint-disable no-return-assign */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable no-else-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable prefer-destructuring */
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
import { toPng } from 'html-to-image';
import { CardBuilder } from 'renderer/card-builder/CardBuilder';

interface ICardPreviewProps extends IContainableProps {
  card: ICard;
}

interface ICardPreviewState extends IContainableState {
  cardPlaceholder: string;
  rendering: string;
}

export class CardPreview extends Containable<ICardPreviewProps, ICardPreviewState> {

  public constructor(props: ICardPreviewProps) {
    super(props);
    this.state = {
      loaded: true,
      cardPlaceholder: require(`../resources/pictures/cardPlaceholder.png`),
      rendering: require(`../resources/pictures/rendering.png`),
    };
  }

  public componentWillReceiveProps(_nextProps: ICardPreviewProps, _prevState: ICardPreviewState) {
    const rendering = document.querySelector('.rendering') as HTMLImageElement;
    rendering.classList.remove('hidden');
  }

  private async onCardReady() {
    const element = document.querySelector('.card-builder') as HTMLElement;
    if (element) {
      try {
        const dataUrl = await toPng(element);
        const img = document.querySelector('.img-render') as HTMLImageElement;
        img.src = dataUrl;

        const rendering = document.querySelector('.rendering') as HTMLImageElement;
        rendering.classList.add('hidden');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
  }

  public render() {
    return this.renderAttributes(<Container>
      <CardBuilder card={this.props.card} onCardReady={() => this.onCardReady()} />
      <Container className='cover' />
      <img className='card-preview-img img-render' src={this.state.cardPlaceholder} alt='cardPreview' />
      <img className='card-preview-img rendering' src={this.state.rendering} alt='cardPreview' />
    </Container>, 'card-preview');
  }
}
