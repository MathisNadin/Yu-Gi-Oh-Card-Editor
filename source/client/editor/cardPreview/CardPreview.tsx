import { CardBuilder, RushCardBuilder } from 'client/editor/cardBuilder';
import { ICardListener } from 'client/editor/card/CardService';
import { ICard } from 'client/editor/card/card-interfaces';
import { toPng } from 'mn-html-to-image';
import { IContainableProps, IContainableState, Containable, Container, Spinner } from 'mn-toolkit';

interface ICardPreviewProps extends IContainableProps {
  card: ICard;
}

interface ICardPreviewState extends IContainableState {
  cardPlaceholder: string;
  rendering: string;
  renderCard: ICard | undefined;
}

export class CardPreview extends Containable<ICardPreviewProps, ICardPreviewState> implements Partial<ICardListener> {
  public constructor(props: ICardPreviewProps) {
    super(props);
    app.$card.addListener(this);
    this.state = {
      ...this.state,
      loaded: true,
      cardPlaceholder: require(`../../../assets/images/cardPlaceholder.png`),
      rendering: require(`../../../assets/images/rendering.png`),
      renderCard: undefined,
    };
  }

  public componentDidUpdate() {
    const rendering = document.querySelector('.rendering') as HTMLImageElement;
    rendering.classList.remove('hidden');
  }

  public componentWillUnmount() {
    app.$card.removeListener(this);
  }

  public renderCardChanged(renderCard: ICard) {
    this.setState({ renderCard });
  }

  private async onPlaceholderCardReady(element: HTMLDivElement) {
    await app.$card.writeCardFile(element, this.state.renderCard!.uuid as string, this.state.renderCard!.name);
  }

  private async onCardReady(element: HTMLDivElement) {
    try {
      const dataUrl = await toPng(element);
      const img = document.querySelector<HTMLImageElement>('.img-render')!;
      img.src = dataUrl;

      const rendering = document.querySelector<HTMLImageElement>('.rendering')!;
      rendering.classList.add('hidden');
    } catch (error) {
      console.error(error);
    }
  }

  public render() {
    return (
      <Container className='card-preview'>
        {!this.state.renderCard?.rush && (
          <CardBuilder
            forRender
            card={this.state.renderCard!}
            onCardReady={(element) => app.$errorManager.handlePromise(this.onPlaceholderCardReady(element))}
            id='placeholder-card-builder'
          />
        )}

        {!!this.state.renderCard?.rush && (
          <RushCardBuilder
            forRender
            card={this.state.renderCard!}
            onCardReady={(element) => app.$errorManager.handlePromise(this.onPlaceholderCardReady(element))}
            id='placeholder-card-builder'
          />
        )}

        <CardBuilder
          card={this.props.card}
          onCardReady={(element) => app.$errorManager.handlePromise(this.onCardReady(element))}
          id='main-card-builder'
        />

        <Container className='cover' />

        <img className='card-preview-img img-render' src={this.state.cardPlaceholder} alt='cardPreview' />

        <Spinner className='card-preview-img rendering' />
      </Container>
    );
  }
}
