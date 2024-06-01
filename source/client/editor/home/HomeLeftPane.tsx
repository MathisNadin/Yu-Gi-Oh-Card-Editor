import { ICard, ICardListener } from 'client/editor/card';
import { CardEditor, RushCardEditor } from 'client/editor/cardEditor';
import {
  IContainerProps,
  IContainerState,
  Container,
  IDeviceListener,
  Spinner,
  VerticalStack,
  HorizontalStack,
  Button,
  Typography,
} from 'mn-toolkit';
import { classNames } from 'mn-tools';

interface IVersionInfos {
  version: string;
  link: string;
  note: string;
}

type TtabIndex = 'master' | 'rush';

interface IHomeLeftPaneProps extends IContainerProps {}

interface IHomeLeftPaneState extends IContainerState {
  tabIndex: TtabIndex;
  currentCard: ICard;
  tempCurrentCard: ICard;
  needUpdate: boolean;
  versionInfos: IVersionInfos;
}

export class HomeLeftPane
  extends Container<IHomeLeftPaneProps, IHomeLeftPaneState>
  implements Partial<ICardListener>, Partial<IDeviceListener>
{
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
    app.$device.addListener(this);
    app.$errorManager.handlePromise(this.checkUpdate());
  }

  public componentWillUnmount() {
    app.$card.removeListener(this);
    app.$device.removeListener(this);
  }

  public deviceOnline() {
    if (this.state.versionInfos) return;
    app.$errorManager.handlePromise(this.checkUpdate());
  }

  public deviceInitialized() {
    if (this.state.versionInfos) return;
    app.$errorManager.handlePromise(this.checkUpdate());
  }

  private async checkUpdate() {
    if (!app.$device.isDesktop || !app.$device.isConnected) return;
    try {
      const versionInfos = await app.$axios.get<IVersionInfos>(
        'https://gist.githubusercontent.com/MathisNadin/e12c2c1494081ff24fbc5463f7c49470/raw/',
        {
          params: {
            timestamp: new Date().getTime(),
          },
        }
      );
      if (versionInfos?.version) {
        await this.setStateAsync({
          versionInfos,
          needUpdate: app.version !== versionInfos.version,
        });
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
    } else if (this.state.currentCard) {
      this.setState({ loaded: true, tempCurrentCard, tabIndex: this.state.currentCard.rush ? 'rush' : 'master' });
    } else {
      this.setState({ loaded: true, tempCurrentCard });
    }
  }

  public tempCurrentCardUpdated(tempCurrentCard: ICard) {
    if (tempCurrentCard) {
      this.setState({ loaded: true, tempCurrentCard, tabIndex: tempCurrentCard.rush ? 'rush' : 'master' });
    } else if (this.state.currentCard) {
      this.setState({ loaded: true, tempCurrentCard, tabIndex: this.state.currentCard.rush ? 'rush' : 'master' });
    } else {
      this.setState({ loaded: true, tempCurrentCard });
    }
  }

  private async onTabChange(tabIndex: TtabIndex) {
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

  public renderClasses() {
    const classes = super.renderClasses();
    classes['home-left-pane'] = true;
    return classes;
  }

  public get children() {
    if (!this.state.loaded) return <Spinner />;
    const { tabIndex, currentCard, tempCurrentCard } = this.state;
    const isMaster = tabIndex === 'master';
    const isRush = tabIndex === 'rush';
    const card = tempCurrentCard || currentCard;
    return [
      this.renderUpdate(),
      <HorizontalStack key='button-tabs' className='button-tabs' gutter itemAlignment='center'>
        <Button
          className={classNames('button-tab', 'master-button-tab', { selected: isMaster })}
          color={isMaster ? 'primary' : '4'}
          label='Master'
          onTap={() => this.onTabChange('master')}
        />
        <Button
          className={classNames('button-tab', 'rush-button-tab', { selected: isRush })}
          color={isRush ? 'negative' : '4'}
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

  private renderUpdate() {
    if (!this.state.needUpdate) return null;
    return (
      <VerticalStack className='new-version' padding gutter itemAlignment='center'>
        {!!this.state.versionInfos.version && (
          <Typography variant='label' content={`Nouvelle version disponible : ${this.state.versionInfos.version}`} />
        )}
        {!!this.state.versionInfos.note && <Typography variant='help' content={this.state.versionInfos.note} />}
        {!!this.state.versionInfos.link && (
          <Button
            label='Installer'
            color='positive'
            onTap={() => app.$device.openExternalLink(this.state.versionInfos.link)}
          />
        )}
      </VerticalStack>
    );
  }
}
