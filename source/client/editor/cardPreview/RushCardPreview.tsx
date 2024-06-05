import { CardBuilder, RushCardBuilder } from 'client/editor/cardBuilder';
import { ICardListener } from 'client/editor/card/CardService';
import { ICard } from 'client/editor/card/card-interfaces';
import { toPng } from 'mn-html-to-image';
import { IContainableProps, IContainableState, Containable, Container, Spinner } from 'mn-toolkit';

interface IRushCardPreviewProps extends IContainableProps {
  card: ICard;
}

interface IRushCardPreviewState extends IContainableState {
  rdCardPlaceholder: string;
  rendering: string;
  renderCard: ICard | undefined;
}

export class RushCardPreview
  extends Containable<IRushCardPreviewProps, IRushCardPreviewState>
  implements Partial<ICardListener>
{
  public constructor(props: IRushCardPreviewProps) {
    super(props);
    app.$card.addListener(this);
    this.state = {
      ...this.state,
      loaded: true,
      rdCardPlaceholder: require(`../../../assets/images/rdCardPlaceholder.png`),
      rendering: require(`../../../assets/images/rendering.png`),
      renderCard: undefined,
    };
  }

  public componentDidUpdate() {
    const rendering = document.querySelector('.rendering')!;
    rendering.classList.remove('hidden');
  }

  public componentWillUnmount() {
    app.$card.removeListener(this);
  }

  public renderCardChanged(renderCard: ICard) {
    this.setState({ renderCard });
  }

  private async onPlaceholderCardReady(element: HTMLDivElement) {
    await app.$card.writeCardFile(
      element,
      (this.state.renderCard as ICard).uuid as string,
      (this.state.renderCard as ICard).name
    );
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
            card={this.state.renderCard as ICard}
            onCardReady={(element) => app.$errorManager.handlePromise(this.onPlaceholderCardReady(element))}
            id='placeholder-card-builder'
          />
        )}

        {!!this.state.renderCard?.rush && (
          <RushCardBuilder
            forRender
            card={this.state.renderCard as ICard}
            onCardReady={(element) => app.$errorManager.handlePromise(this.onPlaceholderCardReady(element))}
            id='placeholder-card-builder'
          />
        )}

        <RushCardBuilder
          card={this.props.card}
          onCardReady={(element) => app.$errorManager.handlePromise(this.onCardReady(element))}
          id='main-card-builder'
        />

        <Container className='cover' />

        <img className='card-preview-img img-render' src={this.state.rdCardPlaceholder} alt='cardPreview' />

        <Spinner className='card-preview-img rendering' />
      </Container>
    );
  }
}
