/* eslint-disable no-else-return */
/* eslint-disable no-plusplus */
/* eslint-disable react/no-array-index-key */
/* eslint-disable prefer-const */
/* eslint-disable import/order */
/* eslint-disable no-undef */
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
import { HorizontalStack } from 'mn-toolkit/container/HorizontalStack';
import { LocalCardsDisplay } from 'renderer/local-cards-display/LocalCardsDisplay';
import { CardEditor } from 'renderer/card-editor/CardEditor';
import { CardPreview } from 'renderer/card-preview/CardPreview';
import { ICardListener } from '../card/CardService';
import { Spinner } from 'mn-toolkit/spinner/Spinner';
import { ICard } from 'renderer/card/card-interfaces';

interface ICardHandlerProps extends IContainableProps {
}

interface ICardHandlerState extends IContainableState {
  currentCard: ICard;
  tempCurrentCard: ICard;
}

export class CardHandler extends Containable<ICardHandlerProps, ICardHandlerState> implements Partial<ICardListener> {

  public constructor(props: ICardHandlerProps) {
    super(props);
    app.$card.addListener(this);
    this.state = { loaded: false } as ICardHandlerState;
  }

  public componentWillUnmount() {
    app.$card.removeListener(this);
  }

  public currentCardLoaded(currentCard: ICard) {
    this.setState({ loaded: true, currentCard });
  }

  public currentCardUpdated(currentCard: ICard) {
    this.setState({ currentCard });
  }

  public tempCurrentCardLoaded(tempCurrentCard: ICard) {
    this.setState({ loaded: true, tempCurrentCard });
  }

  public tempCurrentCardUpdated(tempCurrentCard: ICard) {
    this.setState({ tempCurrentCard });
  }

  public localCardsUpdated() {
    this.forceUpdate();
  }

  private async onCardChange(card: ICard) {
    if (this.state.tempCurrentCard) {
      await app.$card.saveTempCurrentCard(card)
    } else {
      await app.$card.saveCurrentCard(card);
    }
  }

  public render() {
    if (!this.state?.loaded) return <Spinner />;
    const card = this.state.tempCurrentCard || this.state.currentCard;
    return this.renderAttributes(<HorizontalStack gutter>
      <CardEditor card={card} onCardChange={c => app.$errorManager.handlePromise(this.onCardChange(c))} />
      <CardPreview card={card} />
      {!!app.$card.localCards?.length && <LocalCardsDisplay />}
    </HorizontalStack>, 'card-handler');
  }
}
