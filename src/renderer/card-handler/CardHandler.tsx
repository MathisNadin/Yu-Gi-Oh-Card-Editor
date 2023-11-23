import './styles.scss';
import { IContainableProps, IContainableState, Containable } from 'libraries/mn-toolkit/containable/Containable';
import { HorizontalStack } from 'libraries/mn-toolkit/container/HorizontalStack';
import { CardsLibrary } from 'renderer/cards-library/CardsLibrary';
import { CardEditor } from 'renderer/card-editor/CardEditor';
import { CardPreview } from 'renderer/card-preview/CardPreview';
import { ICardListener } from '../card/CardService';
import { Spinner } from 'libraries/mn-toolkit/spinner/Spinner';
import { ICard } from 'renderer/card/card-interfaces';
import { RushCardPreview } from 'renderer/card-preview/RushCardPreview';
import { RushCardEditor } from 'renderer/card-editor/RushCardEditor';
import { VerticalStack } from 'libraries/mn-toolkit/container/VerticalStack';
import { Typography } from 'libraries/mn-toolkit/typography/Typography';
import { IDeviceListener } from 'libraries/mn-toolkit/device';
import { Button } from 'libraries/mn-toolkit/button/Button';
import { Settings } from 'renderer/settings';
import { ButtonTabbedPane } from 'renderer/button-tabbed-pane/ButtonTabbedPane';

interface IVersionInfos {
  version: string;
  link: string;
  note: string;
}

type TLeftTabIndex = 'master' | 'rush';

type TRightTabIndex = 'library' | 'settings';

interface ICardHandlerProps extends IContainableProps {
}

interface ICardHandlerState extends IContainableState {
  leftTabIndex: TLeftTabIndex;
  rightTabIndex: TRightTabIndex;
  currentCard: ICard;
  tempCurrentCard: ICard;
  needUpdate: boolean;
  versionInfos: IVersionInfos;
}

export class CardHandler extends Containable<ICardHandlerProps, ICardHandlerState> implements Partial<ICardListener>, Partial<IDeviceListener> {

  public constructor(props: ICardHandlerProps) {
    super(props);
    app.$card.addListener(this);
    app.$device.addListener(this);
    this.state = {
      leftTabIndex: 'master',
      rightTabIndex: app.$card.localCards?.length ? 'library' : 'settings',
      loaded: false,
    } as ICardHandlerState;

    if (app.$device.isConnected()) {
      app.$errorManager.handlePromise(this.checkUpdate());
    }
  }

  public componentWillUnmount() {
    app.$card.removeListener(this);
    app.$device.removeListener(this);
  }

  public deviceOnline() {
    if (this.state?.versionInfos) return;
    app.$errorManager.handlePromise(this.checkUpdate());
  }

  private async checkUpdate() {
    try {
      const versionInfos = await app.$api.get(
        "https://gist.githubusercontent.com/MathisNadin/e12c2c1494081ff24fbc5463f7c49470/raw/",
        {
          params: {
            timestamp: new Date().getTime()
          }
        }
      ) as IVersionInfos;
      if (versionInfos?.version) {
        const currentVersion = await window.electron.ipcRenderer.getAppVersion();
        this.setState({ versionInfos, needUpdate: currentVersion !== versionInfos.version });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  public currentCardLoaded(currentCard: ICard) {
    this.setState({ loaded: true, currentCard, leftTabIndex: currentCard.rush ? 'rush' : 'master' });
  }

  public currentCardUpdated(currentCard: ICard) {
    this.setState({ currentCard, leftTabIndex: currentCard.rush ? 'rush' : 'master' });
  }

  public tempCurrentCardLoaded(tempCurrentCard: ICard) {
    if (tempCurrentCard) {
      this.setState({ loaded: true, tempCurrentCard, leftTabIndex: tempCurrentCard.rush ? 'rush' : 'master' });
    } else {
      this.setState({ loaded: true, tempCurrentCard });
    }
  }

  public tempCurrentCardUpdated(tempCurrentCard: ICard) {
    if (tempCurrentCard) {
      this.setState({ loaded: true, tempCurrentCard, leftTabIndex: tempCurrentCard.rush ? 'rush' : 'master' });
    } else {
      this.setState({ loaded: true, tempCurrentCard });
    }
  }

  private async onCardChange(card: ICard) {
    if (this.state.tempCurrentCard) {
      await app.$card.saveTempCurrentCard(card);
    } else {
      await app.$card.saveCurrentCard(card);
    }
  }

  public localCardsUpdated(localCards: ICard[], handlerShouldUpdate: boolean) {
    console.log('handlerShouldUpdate ============>', handlerShouldUpdate);
    if (handlerShouldUpdate) {
      this.setState({ rightTabIndex: !localCards.length ? 'settings' : this.state.rightTabIndex });
      this.forceUpdate();
    }
  }

  private async onLeftTabChange() {
    if (this.state.tempCurrentCard) {
      await app.$card.convertTempCurrentCard();
    } else {
      await app.$card.convertCurrentCard();
    }
  }

  public render() {
    if (!this.state.loaded) return <Spinner />;
    const card = this.state.tempCurrentCard || this.state.currentCard;
    return this.renderAttributes(<HorizontalStack gutter itemAlignment='center'>
      <ButtonTabbedPane
        tab1={{ id: 'master', label: 'Master', selectedColor: 'royal' }}
        tab2={{ id: 'rush', label: 'Rush', selectedColor: 'assertive' }}
        defaultValue={this.state.leftTabIndex}
        onChange={() => this.onLeftTabChange()}
      >
        <CardEditor id='master' card={card} onCardChange={c => app.$errorManager.handlePromise(this.onCardChange(c))} />
        <RushCardEditor id='rush' card={card} onCardChange={c => app.$errorManager.handlePromise(this.onCardChange(c))} />
      </ButtonTabbedPane>

      {card.rush && <RushCardPreview card={card} />}
      {!card.rush && <CardPreview card={card} />}

      <ButtonTabbedPane
        tab1={app.$card.localCards?.length ? { id: 'library', label: 'Bibliothèque', selectedColor: 'positive' } : undefined}
        tab2={{ id: 'settings', label: 'Paramètres', selectedColor: 'calm' }}
        defaultValue={this.state.rightTabIndex}
      >
        <CardsLibrary id='library' />
        <Settings id='settings' />
      </ButtonTabbedPane>
    </HorizontalStack>, 'card-handler');
  }

  private renderUpdate() {
    if (!this.state.needUpdate) return null;
    return <VerticalStack className='new-version' margin padding gutter itemAlignment='center'>
      {!!this.state.versionInfos.version && <Typography variant='label' content={`Nouvelle version disponible : ${this.state.versionInfos.version}`} />}
      {!!this.state.versionInfos.note && <Typography variant='help' content={this.state.versionInfos.note} />}
      {!!this.state.versionInfos.link && <Button label='Installer' color='balanced' onTap={() => window.electron.ipcRenderer.openLink(this.state.versionInfos.link)} />}
    </VerticalStack>;
  }
}
