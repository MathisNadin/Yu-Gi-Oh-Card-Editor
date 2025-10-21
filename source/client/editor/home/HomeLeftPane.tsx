import { classNames } from 'mn-tools';
import { IContainerProps, IContainerState, Container, Spinner, HorizontalStack, Button } from 'mn-toolkit';
import { ICard, ICardListener } from '../card';
import { CardEditor, RushCardEditor } from '../cardEditor';

type TTabIndex = 'master' | 'rush';

interface IHomeLeftPaneProps extends IContainerProps {}

interface IHomeLeftPaneState extends IContainerState {
  tabIndex: TTabIndex;
  currentCard?: ICard;
  tempCurrentCard?: ICard;
}

export class HomeLeftPane extends Container<IHomeLeftPaneProps, IHomeLeftPaneState> implements Partial<ICardListener> {
  public static get defaultProps(): IHomeLeftPaneProps {
    return {
      ...super.defaultProps,
      padding: true,
      gutter: true,
      layout: 'vertical',
    };
  }

  public constructor(props: IHomeLeftPaneProps) {
    super(props);
    this.state = {
      ...this.state,
      tabIndex: 'master',
    };
    app.$card.addListener(this);
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    app.$card.removeListener(this);
  }

  public currentCardLoaded(currentCard: ICard) {
    this.setState({ loaded: true, currentCard, tabIndex: currentCard.rush ? 'rush' : 'master' });
  }

  public currentCardUpdated(currentCard: ICard) {
    this.setState({ currentCard, tabIndex: currentCard.rush ? 'rush' : 'master' });
  }

  public tempCurrentCardLoaded(tempCurrentCard: ICard | undefined) {
    if (tempCurrentCard) {
      this.setState({ loaded: true, tempCurrentCard, tabIndex: tempCurrentCard.rush ? 'rush' : 'master' });
    } else if (this.state.currentCard) {
      this.setState({ loaded: true, tempCurrentCard, tabIndex: this.state.currentCard.rush ? 'rush' : 'master' });
    } else {
      this.setState({ loaded: true, tempCurrentCard });
    }
  }

  public tempCurrentCardUpdated(tempCurrentCard: ICard | undefined) {
    if (tempCurrentCard) {
      this.setState({ loaded: true, tempCurrentCard, tabIndex: tempCurrentCard.rush ? 'rush' : 'master' });
    } else if (this.state.currentCard) {
      this.setState({ loaded: true, tempCurrentCard, tabIndex: this.state.currentCard.rush ? 'rush' : 'master' });
    } else {
      this.setState({ loaded: true, tempCurrentCard });
    }
  }

  private async onTabChange(tabIndex: TTabIndex) {
    await this.setStateAsync({ tabIndex });
    if (this.state.tempCurrentCard) {
      await app.$card.convertTempCurrentCard();
    } else {
      await app.$card.convertCurrentCard();
    }
  }

  private async onCardChange(card: ICard) {
    if (this.state.tempCurrentCard) {
      await app.$card.saveTempCurrentCard(card);
    } else {
      await app.$card.saveCurrentCard(card);
    }
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['home-left-pane'] = true;
    return classes;
  }

  public override get children() {
    if (!this.state.loaded) return <Spinner />;
    const { tabIndex, currentCard, tempCurrentCard } = this.state;
    const isMaster = tabIndex === 'master';
    const isRush = tabIndex === 'rush';
    const card = tempCurrentCard || currentCard;
    return [
      <HorizontalStack key='button-tabs' className='button-tabs' gutter itemAlignment='center'>
        <Button
          className={classNames('button-tab', 'master-button-tab', { selected: isMaster })}
          size='small'
          color={isMaster ? 'primary' : '4'}
          name='Master'
          label='Master'
          onTap={() => this.onTabChange('master')}
        />
        <Button
          className={classNames('button-tab', 'rush-button-tab', { selected: isRush })}
          size='small'
          color={isRush ? 'negative' : '4'}
          name='Rush'
          label='Rush'
          onTap={() => this.onTabChange('rush')}
        />
      </HorizontalStack>,
      isMaster && (
        <CardEditor
          key='master-card-editor'
          id='master'
          card={card}
          onCardChange={(c) => app.$errorManager.handlePromise(this.onCardChange(c))}
        />
      ),
      isRush && (
        <RushCardEditor
          key='rush-card-editor'
          id='rush'
          card={card}
          onCardChange={(c) => app.$errorManager.handlePromise(this.onCardChange(c))}
        />
      ),
    ];
  }
}
