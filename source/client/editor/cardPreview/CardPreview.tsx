import { CardBuilder, RushCardBuilder } from 'client/editor/cardBuilder';
import { ICardListener } from 'client/editor/card/CardService';
import { ICard } from 'client/editor/card/card-interfaces';
import { toPng } from 'mn-html-to-image';
import { IContainableProps, IContainableState, Containable, Container, Spinner } from 'mn-toolkit';
import { classNames } from 'mn-tools';
import { createRef } from 'react';

interface ICardPreviewProps extends IContainableProps {
  card: ICard;
}

interface ICardPreviewState extends IContainableState {
  hideSpinner: boolean;
  renderCard?: ICard;
}

export class CardPreview extends Containable<ICardPreviewProps, ICardPreviewState> implements Partial<ICardListener> {
  private renderRef = createRef<HTMLImageElement>();

  public constructor(props: ICardPreviewProps) {
    super(props);
    app.$card.addListener(this);
    this.state = {
      ...this.state,
      loaded: true,
      hideSpinner: false,
      renderCard: undefined,
    };
  }

  public componentWillUnmount() {
    app.$card.removeListener(this);
  }

  public renderCardChanged(renderCard: ICard) {
    this.setState({ renderCard });
  }

  private async onPlaceholderCardReady(element: HTMLDivElement) {
    await app.$card.writeCardFile(element, this.state.renderCard!.uuid!, this.state.renderCard!.name);
  }

  private async onCardReady(element: HTMLDivElement) {
    if (!this.renderRef.current) return this.setState({ hideSpinner: true });
    try {
      const dataUrl = await toPng(element);
      this.renderRef.current.src = dataUrl;
    } catch (error) {
      console.error(error);
    } finally {
      this.setState({ hideSpinner: true });
    }
  }

  public render() {
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
          onUpdating={() => this.state.hideSpinner && this.setState({ hideSpinner: false })}
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

        <Spinner className={classNames('card-preview-img', 'rendering', { hidden: this.state.hideSpinner })} />
      </Container>
    );
  }
}
