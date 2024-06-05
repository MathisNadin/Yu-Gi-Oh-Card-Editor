import { ICardListener, ICard } from 'client/editor/card';
import { CardsLibrary } from 'client/editor/cardsLibrary';
import { Settings } from 'client/editor/settings';
import { IContainerProps, IContainerState, Container, Spinner, HorizontalStack, Button } from 'mn-toolkit';
import { classNames } from 'mn-tools';

type TtabIndex = 'library' | 'settings';

interface IHomeRightPaneProps extends IContainerProps {}

interface IHomeRightPaneState extends IContainerState {
  tabIndex: TtabIndex;
}

export class HomeRightPane
  extends Container<IHomeRightPaneProps, IHomeRightPaneState>
  implements Partial<ICardListener>
{
  public static get defaultProps(): IHomeRightPaneProps {
    return {
      ...super.defaultProps,
      padding: true,
      gutter: true,
      layout: 'vertical',
    };
  }

  public constructor(props: IHomeRightPaneProps) {
    super(props);
    this.state = {
      ...this.state,
      tabIndex: app.$card.localCards?.length ? 'library' : 'settings',
    };

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

  public renderClasses() {
    const classes = super.renderClasses();
    classes['home-right-pane'] = true;
    return classes;
  }

  public get children() {
    if (!this.state.loaded) return <Spinner />;
    const { tabIndex } = this.state;
    const isLibrary = tabIndex === 'library';
    return [
      <HorizontalStack key='button-tabs' className='button-tabs' gutter itemAlignment='center'>
        {!!app.$card.localCards?.length && (
          <Button
            className={classNames('button-tab', 'library-button-tab', { selected: isLibrary })}
            color={isLibrary ? 'neutral' : '4'}
            label='Bibliothèque'
            onTap={() => this.onTabChange('library')}
          />
        )}
        <Button
          className={classNames('button-tab', 'settings-button-tab', { selected: !isLibrary })}
          color={!isLibrary ? 'info' : '4'}
          label='Paramètres'
          onTap={() => this.onTabChange('settings')}
        />
      </HorizontalStack>,
      isLibrary && <CardsLibrary key='card-library' />,
      !isLibrary && <Settings key='settings' />,
    ];
  }
}
