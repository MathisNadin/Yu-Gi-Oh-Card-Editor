import './styles.scss';
import { IContainableProps, IContainableState, Containable } from 'libraries/mn-toolkit/containable/Containable';
import { HorizontalStack } from 'libraries/mn-toolkit/container/HorizontalStack';
import { Spinner } from 'libraries/mn-toolkit/spinner/Spinner';
import { VerticalStack } from 'libraries/mn-toolkit/container/VerticalStack';
import { Button } from 'libraries/mn-toolkit/button/Button';
import { classNames } from 'libraries/mn-tools';
import { ICardListener } from 'renderer/card/CardService';
import { ICard } from 'renderer/card/card-interfaces';
import { CardsLibrary } from 'renderer/cards-library/CardsLibrary';
import { Settings } from 'renderer/settings';

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
