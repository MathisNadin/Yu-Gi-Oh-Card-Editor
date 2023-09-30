import { IContainableProps, IContainableState, Containable } from 'libraries/mn-toolkit/containable/Containable';
import './styles.css';
import { HorizontalStack } from 'libraries/mn-toolkit/container/HorizontalStack';
import { LocalCardsDisplay } from 'renderer/local-cards-display/LocalCardsDisplay';
import { CardEditor } from 'renderer/card-editor/CardEditor';
import { CardPreview } from 'renderer/card-preview/CardPreview';
import { ICardListener } from '../card/CardService';
import { Spinner } from 'libraries/mn-toolkit/spinner/Spinner';
import { ICard } from 'renderer/card/card-interfaces';
import { RushCardPreview } from 'renderer/card-preview/RushCardPreview';
import { RushCardEditor } from 'renderer/card-editor/RushCardEditor';
import { TabbedPane } from 'libraries/mn-toolkit/tabs/TabbedPane';
import { TabPane } from 'libraries/mn-toolkit/tabs/TabPane';

type TTabIndex = 'master' | 'rush';

interface ICardHandlerProps extends IContainableProps {
}

interface ICardHandlerState extends IContainableState {
  tabIndex: TTabIndex;
  currentCard: ICard;
  tempCurrentCard: ICard;
}

export class CardHandler extends Containable<ICardHandlerProps, ICardHandlerState> implements Partial<ICardListener> {

  public constructor(props: ICardHandlerProps) {
    super(props);
    app.$card.addListener(this);
    this.state = { tabIndex: 'master', loaded: false } as ICardHandlerState;
  }

  public componentWillUnmount() {
    app.$card.removeListener(this);
  }

  public currentCardLoaded(currentCard: ICard) {
    this.setState({ loaded: true, currentCard, tabIndex: currentCard.rush ? 'rush' : 'master' });
  }

  public currentCardUpdated(currentCard: ICard) {
    this.setState({ currentCard, tabIndex: currentCard.rush ? 'rush' : 'master' });
  }

  public tempCurrentCardLoaded(tempCurrentCard: ICard) {
    this.setState({ loaded: true, tempCurrentCard, tabIndex: tempCurrentCard.rush ? 'rush' : 'master' });
  }

  public tempCurrentCardUpdated(tempCurrentCard: ICard) {
    this.setState({ tempCurrentCard, tabIndex: tempCurrentCard ? tempCurrentCard.rush ? 'rush' : 'master' : this.state.tabIndex });
  }

  public localCardsUpdated() {
    this.forceUpdate();
  }

  private async onCardChange(card: ICard) {
    if (this.state.tempCurrentCard) {
      await app.$card.saveTempCurrentCard(card);
    } else {
      await app.$card.saveCurrentCard(card);
    }
  }

  private async onTabChange(tabIndex: TTabIndex) {
    this.setState({ tabIndex });
    if (this.state.tempCurrentCard) {
      await app.$card.convertTempCurrentCard();
    } else {
      await app.$card.convertCurrentCard();
    }
  }

  public render() {
    if (!this.state?.loaded) return <Spinner />;
    const card = this.state.tempCurrentCard || this.state.currentCard;
    return this.renderAttributes(<HorizontalStack gutter>
      <TabbedPane
        tabPosition='top'
        className='editor-tabbed-pane'
        defaultValue={this.state.tabIndex}
        onChange={tabIndex => this.onTabChange(tabIndex as TTabIndex)}
      >

        <TabPane id='master' scroll label='Master' gutter>
          <CardEditor card={card} onCardChange={c => app.$errorManager.handlePromise(this.onCardChange(c))} />
        </TabPane>

        <TabPane id='rush' scroll label='Rush' gutter>
          <RushCardEditor card={card} onCardChange={c => app.$errorManager.handlePromise(this.onCardChange(c))} />
        </TabPane>
      </TabbedPane>
      {card.rush ? <RushCardPreview card={card} /> : <CardPreview card={card} />}
      {!!app.$card.localCards?.length && <LocalCardsDisplay />}
    </HorizontalStack>, 'card-handler');
  }
}
