import { ICard, ICardListener } from 'client/editor/card';
import { CardEditor, RushCardEditor } from 'client/editor/cardEditor';
import {
  IContainableProps,
  IContainableState,
  Containable,
  IDeviceListener,
  Spinner,
  VerticalStack,
  HorizontalStack,
  Button,
  Typography,
} from 'libraries/mn-toolkit';
import { classNames } from 'libraries/mn-tools';

interface IVersionInfos {
  version: string;
  link: string;
  note: string;
}

type TtabIndex = 'master' | 'rush';

interface IHomeLeftPaneProps extends IContainableProps {}

interface IHomeLeftPaneState extends IContainableState {
  tabIndex: TtabIndex;
  currentCard: ICard;
  tempCurrentCard: ICard;
  needUpdate: boolean;
  versionInfos: IVersionInfos;
}

export class HomeLeftPane
  extends Containable<IHomeLeftPaneProps, IHomeLeftPaneState>
  implements Partial<ICardListener>, Partial<IDeviceListener>
{
  public constructor(props: IHomeLeftPaneProps) {
    super(props);
    this.state = {
      tabIndex: 'master',
      loaded: false,
    } as IHomeLeftPaneState;

    app.$card.addListener(this);
    app.$device.addListener(this);

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
      const versionInfos = await app.$api.get<IVersionInfos>(
        'https://gist.githubusercontent.com/MathisNadin/e12c2c1494081ff24fbc5463f7c49470/raw/',
        {
          params: {
            timestamp: new Date().getTime(),
          },
        }
      );
      if (versionInfos?.version) {
        this.setState({
          versionInfos,
          needUpdate: app.$device.getSpec().client.version !== versionInfos.version,
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

  private async onTabChange(tabIndex: TtabIndex) {
    this.setState({ tabIndex }, () => {
      if (this.state.tempCurrentCard) {
        app.$errorManager.handlePromise(app.$card.convertTempCurrentCard());
      } else {
        app.$errorManager.handlePromise(app.$card.convertCurrentCard());
      }
    });
  }

  private async onCardChange(card: ICard) {
    if (this.state.tempCurrentCard) {
      await app.$card.saveTempCurrentCard(card);
    } else {
      await app.$card.saveCurrentCard(card);
    }
  }

  public render() {
    if (!this.state.loaded) return <Spinner />;

    const { loaded, tabIndex, currentCard, tempCurrentCard } = this.state;
    const isMaster = tabIndex === 'master';
    const card = tempCurrentCard || currentCard;

    return this.renderAttributes(
      <VerticalStack margin gutter itemAlignment='center'>
        {!loaded && <Spinner />}
        {loaded && this.renderUpdate()}
        {loaded && (
          <HorizontalStack className='button-tabs' gutter itemAlignment='center'>
            <Button
              className={classNames('button-tab', 'master-button-tab', { selected: isMaster })}
              color={isMaster ? 'royal' : '4'}
              label='Master'
              onTap={() => this.onTabChange('master')}
            />
            <Button
              className={classNames('button-tab', 'rush-button-tab', { selected: !isMaster })}
              color={!isMaster ? 'assertive' : '4'}
              label='Rush'
              onTap={() => this.onTabChange('rush')}
            />
          </HorizontalStack>
        )}
        {loaded && isMaster && (
          <CardEditor
            id='master'
            card={card}
            onCardChange={(c) => app.$errorManager.handlePromise(this.onCardChange(c))}
          />
        )}
        {loaded && !isMaster && (
          <RushCardEditor
            id='rush'
            card={card}
            onCardChange={(c) => app.$errorManager.handlePromise(this.onCardChange(c))}
          />
        )}
      </VerticalStack>,
      'home-left-pane'
    );
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
            color='balanced'
            onTap={() => app.$device.openExternalLink(this.state.versionInfos.link)}
          />
        )}
      </VerticalStack>
    );
  }
}
