import { createRef } from 'react';
import { toPng } from 'mn-html-to-image';
import { IContainableProps, IContainableState, Containable, Container, Spinner } from 'mn-toolkit';
import { CardBuilder, RushCardBuilder } from 'client/editor';
import { ICard, ICardListener } from 'client/editor/card';

interface ICardPreviewProps extends IContainableProps {
  card: ICard;
}

interface ICardPreviewState extends IContainableState {
  renderCard?: ICard;
}

export class CardPreview extends Containable<ICardPreviewProps, ICardPreviewState> implements Partial<ICardListener> {
  private renderRef = createRef<HTMLImageElement>();
  private spinnerRef = createRef<Spinner>();
  private hideSpinner = false;

  public constructor(props: ICardPreviewProps) {
    super(props);
    app.$card.addListener(this);
    this.state = {
      ...this.state,
      loaded: true,
      renderCard: undefined,
    };
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    app.$card.removeListener(this);
  }

  public renderCardChanged(renderCard: ICard | undefined) {
    this.setState({ renderCard });
  }

  private async onPlaceholderCardReady(element: HTMLDivElement) {
    if (!this.state.renderCard) return;
    await app.$card.writeCardFile(element, this.state.renderCard);
  }

  private async onCardReady(element: HTMLDivElement) {
    if (!this.renderRef.current) return this.toggleSpinner(true);
    try {
      const dataUrl = await toPng(element);
      if (this.renderRef.current) this.renderRef.current.src = dataUrl;
    } catch (error) {
      console.error(error);
    } finally {
      this.toggleSpinner(true);
    }
  }

  private toggleSpinner(hideSpinner: boolean) {
    if (!this.spinnerRef.current?.base?.current || this.hideSpinner === hideSpinner) return;
    this.hideSpinner = hideSpinner;
    if (hideSpinner) this.spinnerRef.current.base.current.classList.add('hidden');
    else this.spinnerRef.current.base.current.classList.remove('hidden');
  }

  public override render() {
    return (
      <Container className='card-preview'>
        {!!this.state.renderCard && !this.state.renderCard.rush && (
          <CardBuilder
            forRender
            card={this.state.renderCard}
            onCardReady={(element) => app.$errorManager.handlePromise(this.onPlaceholderCardReady(element))}
            id='placeholder-card-builder'
          />
        )}

        {!!this.state.renderCard && this.state.renderCard.rush && (
          <RushCardBuilder
            forRender
            card={this.state.renderCard}
            onCardReady={(element) => app.$errorManager.handlePromise(this.onPlaceholderCardReady(element))}
            id='placeholder-card-builder'
          />
        )}

        <CardBuilder
          card={this.props.card}
          onUpdating={() => this.hideSpinner && this.toggleSpinner(false)}
          onCardReady={(element) => app.$errorManager.handlePromise(this.onCardReady(element))}
          id='main-card-builder'
        />

        <Container className='cover' />

        <img
          ref={this.renderRef}
          className='card-preview-img img-render'
          src={app.$card.paths.master.placeholder}
          alt='cardPreview'
        />

        <Spinner ref={this.spinnerRef} className='card-preview-img rendering' />
      </Container>
    );
  }
}
