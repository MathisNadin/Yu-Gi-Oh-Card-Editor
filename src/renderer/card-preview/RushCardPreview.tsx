/* eslint-disable no-undef */
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
import { ICard } from 'renderer/card/card-interfaces';
import { RushCardBuilder } from 'renderer/card-builder/RushCardBuilder';
import { Spinner } from 'mn-toolkit/spinner/Spinner';
import { ICardListener } from 'renderer/card/CardService';
import { toPng } from 'mn-html-to-image';

interface IRushCardPreviewProps extends IContainableProps {
  card: ICard;
}

interface IRushCardPreviewState extends IContainableState {
  rdCardPlaceholder: string;
  rendering: string;
  renderCard: ICard | undefined;
}

export class RushCardPreview extends Containable<IRushCardPreviewProps, IRushCardPreviewState> implements Partial<ICardListener> {

  public constructor(props: IRushCardPreviewProps) {
    super(props);
    app.$card.addListener(this);
    this.state = {
      loaded: true,
      rdCardPlaceholder: require(`../resources/pictures/rdCardPlaceholder.png`),
      rendering: require(`../resources/pictures/rendering.png`),
      renderCard: undefined,
    };
  }

  public componentWillReceiveProps(_nextProps: IRushCardPreviewProps, _prevState: IRushCardPreviewState) {
    const rendering = document.querySelector('.rendering') as HTMLImageElement;
    rendering.classList.remove('hidden');
  }

  public componentWillUnmount() {
    app.$card.removeListener(this);
  }

  public renderCardChanged(renderCard: ICard) {
    this.setState({ renderCard });
  }

  private async onPlaceholderCardReady() {
    await app.$card.writeCardFile('placeholder-card-builder', (this.state.renderCard as ICard).uuid as string, (this.state.renderCard as ICard).name);
  }

  private async onCardReady() {
    const element = document.getElementById('main-card-builder') as HTMLElement;
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
      <RushCardBuilder forRender card={this.state.renderCard as ICard} onCardReady={() => app.$errorManager.handlePromise(this.onPlaceholderCardReady())} id='placeholder-card-builder' />
      <RushCardBuilder card={this.props.card} onCardReady={() => app.$errorManager.handlePromise(this.onCardReady())} id='main-card-builder' />
      <Container className='cover' />
      <img className='card-preview-img img-render' src={this.state.rdCardPlaceholder} alt='cardPreview' />
      <Spinner className='card-preview-img rendering' />
    </Container>, 'card-preview');
  }
}
