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
import { BatchDisplay } from 'renderer/batch-display/BatchDisplay';
import { CardEditor } from 'renderer/card-editor/CardEditor';
import { CardPreview } from 'renderer/card-preview/CardPreview';
import { ICard, ICardListener } from '../card/CardService';
import { Spinner } from 'mn-toolkit/spinner/Spinner';

interface ICardHandlerProps extends IContainableProps {
}

interface ICardHandlerState extends IContainableState {
  card: ICard;
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
    this.setState({ loaded: true, card: currentCard });
  }

  public currentCardUpdated(currentCard: ICard) {
    this.setState({ card: currentCard });
  }

  private onCardChange(card: ICard) {
    app.$errorManager.handlePromise(app.$card.saveCurrentCard(card));
  }

  public render() {
    if (!this.state?.loaded) return <Spinner />;
    return this.renderAttributes(<HorizontalStack gutter>
      <CardEditor card={this.state.card} onCardChange={card => this.onCardChange(card)} />
      <CardPreview card={this.state.card} />
      <BatchDisplay />
    </HorizontalStack>, 'card-handler');
  }
}
