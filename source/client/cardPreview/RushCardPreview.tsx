import { CardBuilder, RushCardBuilder } from 'client/cardBuilder';
import { ICardListener } from 'client/card/CardService';
import { ICard } from 'client/card/card-interfaces';
import { toPng } from 'libraries/mn-html-to-image';
import { IContainableProps, IContainableState, Containable, Container, Spinner } from 'libraries/mn-toolkit';

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
      {!this.state.renderCard?.rush && <CardBuilder forRender card={this.state.renderCard as ICard} onCardReady={() => app.$errorManager.handlePromise(this.onPlaceholderCardReady())} id='placeholder-card-builder' />}

      {!!this.state.renderCard?.rush && <RushCardBuilder forRender card={this.state.renderCard as ICard} onCardReady={() => app.$errorManager.handlePromise(this.onPlaceholderCardReady())} id='placeholder-card-builder' />}

      <RushCardBuilder card={this.props.card} onCardReady={() => app.$errorManager.handlePromise(this.onCardReady())} id='main-card-builder' />

      <Container className='cover' />

      <img className='card-preview-img img-render' src={this.state.rdCardPlaceholder} alt='cardPreview' />

      <Spinner className='card-preview-img rendering' />
    </Container>, 'card-preview');
  }
}
