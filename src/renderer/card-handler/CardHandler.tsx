import './styles.css';
import { IContainableProps, IContainableState, Containable } from 'libraries/mn-toolkit/containable/Containable';
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
import { VerticalStack } from 'libraries/mn-toolkit/container/VerticalStack';
import { Typography } from 'libraries/mn-toolkit/typography/Typography';
import { IDeviceListener } from 'libraries/mn-toolkit/device';
import { Button } from 'libraries/mn-toolkit/button/Button';
import { classNames } from 'libraries/mn-tools';

interface IVersionInfos {
  version: string;
  link: string;
  note: string;
}

type TTabIndex = 'master' | 'rush';

interface ICardHandlerProps extends IContainableProps {
}

interface ICardHandlerState extends IContainableState {
  tabIndex: TTabIndex;
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
    this.state = { tabIndex: 'master', loaded: false } as ICardHandlerState;
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
    this.setState({ loaded: true, currentCard, tabIndex: currentCard.rush ? 'rush' : 'master' });
  }

  public currentCardUpdated(currentCard: ICard) {
    this.setState({ currentCard, tabIndex: currentCard.rush ? 'rush' : 'master' });
  }

  public tempCurrentCardLoaded(tempCurrentCard: ICard) {
    if (tempCurrentCard) {
      this.setState({ loaded: true, tempCurrentCard, tabIndex: tempCurrentCard.rush ? 'rush' : 'master' });
    } else {
      this.setState({ loaded: true, tempCurrentCard });
    }
  }

  public tempCurrentCardUpdated(tempCurrentCard: ICard) {
    if (tempCurrentCard) {
      this.setState({ loaded: true, tempCurrentCard, tabIndex: tempCurrentCard.rush ? 'rush' : 'master' });
    } else {
      this.setState({ loaded: true, tempCurrentCard });
    }
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
    if (!this.state.loaded) return <Spinner />;
    const isMaster = this.state.tabIndex === 'master';
    const card = this.state.tempCurrentCard || this.state.currentCard;
    return this.renderAttributes(<HorizontalStack gutter itemAlignment='center'>
      <VerticalStack className='editor-tabbed-pane' margin gutter>
        <HorizontalStack className='mode-tabs' gutter itemAlignment='center'>
          <Button className={classNames('master-tab', { 'selected': isMaster })} color={isMaster ? 'balanced' : '4'} label='Master' onTap={() => this.onTabChange('master')} />
          <Button className={classNames('rush-tab', { 'selected': !isMaster })} color={!isMaster ? 'balanced' : '4'} label='Rush' onTap={() => this.onTabChange('rush')} />
        </HorizontalStack>
        {this.renderUpdate()}
        {isMaster && <CardEditor card={card} onCardChange={c => app.$errorManager.handlePromise(this.onCardChange(c))} />}
        {!isMaster && <RushCardEditor card={card} onCardChange={c => app.$errorManager.handlePromise(this.onCardChange(c))} />}
      </VerticalStack>
      {card.rush ? <RushCardPreview card={card} /> : <CardPreview card={card} />}
      {!!app.$card.localCards?.length && <LocalCardsDisplay />}
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
