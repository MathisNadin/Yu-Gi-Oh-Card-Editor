import { ICardListener, ICard } from 'client/card';
import { CardsLibrary } from 'client/cardsLibrary';
import { Settings } from 'client/settings';
import { IContainableProps, IContainableState, Containable, VerticalStack, Spinner, HorizontalStack, Button } from 'libraries/mn-toolkit';
import { classNames } from 'libraries/mn-tools';

type TtabIndex = 'library' | 'settings';

interface IHomeRightPaneProps extends IContainableProps {}

interface IHomeRightPaneState extends IContainableState {
  tabIndex: TtabIndex;
}

export class HomeRightPane extends Containable<IHomeRightPaneProps, IHomeRightPaneState> implements Partial<ICardListener> {

  public constructor(props: IHomeRightPaneProps) {
    super(props);
    this.state = {
      tabIndex: app.$card.localCards?.length ? 'library' : 'settings',
      loaded: false,
    } as IHomeRightPaneState;

    app.$card.addListener(this);
  }

  public componentWillUnmount() {
    app.$card.removeListener(this);
  }

  private async onTabChange(tabIndex: TtabIndex) {
    this.setState({ tabIndex });
  }

  public localCardsLoaded(localCards: ICard[]) {
    this.setState({ loaded: true, tabIndex: !localCards.length ? 'settings' : 'library' });
  }

  public localCardsUpdated(localCards: ICard[]) {
    this.setState({ loaded: true, tabIndex: !localCards.length ? 'settings' : 'library' });
  }

  public render() {
    const { loaded, tabIndex } = this.state;
    const isLibrary = tabIndex === 'library'
    return this.renderAttributes(<VerticalStack margin gutter itemAlignment='center'>
      {!loaded && <Spinner />}
      {loaded && <HorizontalStack className='button-tabs' gutter itemAlignment='center'>
         {!!app.$card.localCards?.length && <Button
          className={classNames('button-tab', 'library-button-tab', { 'selected': isLibrary })}
          color={isLibrary ? 'positive' : '4'}
          label='Bibliothèque'
          onTap={() => this.onTabChange('library')}
        />}
         <Button
          className={classNames('button-tab', 'settings-button-tab', { 'selected': !isLibrary })}
          color={!isLibrary ? 'calm' : '4'}
          label='Paramètres'
          onTap={() => this.onTabChange('settings')}
        />
      </HorizontalStack>}
      {loaded && isLibrary && <CardsLibrary />}
      {loaded && !isLibrary && <Settings />}
    </VerticalStack>, 'home-right-pane');
  }
}
