import { classNames, isString } from 'mn-tools';
import { IContainerProps, IContainerState, Container, Spinner, HorizontalStack, Button } from 'mn-toolkit';
import { ICoreListener } from '../../kernel';
import { ICard, ICardListener } from '../card';
import { CardEditor, RushCardEditor } from '../cardEditor';

type TUpdateChoice = 'update-restart' | 'update-close' | 'later';

type TTabIndex = 'master' | 'rush';

interface IHomeLeftPaneProps extends IContainerProps {}

interface IHomeLeftPaneState extends IContainerState {
  tabIndex: TTabIndex;
  currentCard?: ICard;
  tempCurrentCard?: ICard;
}

export class HomeLeftPane
  extends Container<IHomeLeftPaneProps, IHomeLeftPaneState>
  implements Partial<ICoreListener>, Partial<ICardListener>
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
    app.$core.addListener(this);
    app.$card.addListener(this);
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    app.$core.removeListener(this);
    app.$card.removeListener(this);
  }

  public electronUpdateDownloaded(info: TElectronUpdateInfo) {
    app.$errorManager.handlePromise(this.showUpdateDialog(info));
  }

  private async showUpdateDialog(info: TElectronUpdateInfo) {
    if (!app.$device.isElectron(window)) return;

    let message = '';

    // Add release notes if available
    if (info.releaseNotes) {
      if (isString(info.releaseNotes)) {
        message += `Notes de version :<br>${info.releaseNotes.replaceAll('\n\n', '<br>').replaceAll('\n', '<br>')}<br><br>`;
      } else if (Array.isArray(info.releaseNotes)) {
        const formattedNotes = info.releaseNotes.map((note) => (isString(note) ? note : note.note)).join('<br>');
        message += `Notes de version :<br>${formattedNotes}<br><br>`;
      }
    }

    // Add the default message
    message +=
      "Si vous ne mettez pas à jour tout de suite, la mise à jour sera faite automatiquement à la fermeture de l'application.";

    const choice = await app.$popup.choice<TUpdateChoice>({
      title: `Une nouvelle version est disponible : ${info.version}`,
      messageType: 'html',
      message,
      choices: [
        { id: 'update-restart', label: 'Mettre à jour et redémarrer', color: 'positive' },
        { id: 'update-close', label: 'Mettre à jour et fermer', color: 'neutral' },
        { id: 'later', label: 'Plus tard', color: '2' },
      ],
    });

    switch (choice) {
      case 'update-restart':
        await window.electron.ipcRenderer.invoke('setAutoRunAppAfterInstall', true);
        await window.electron.ipcRenderer.invoke('quitAndInstallAppUpdate');
        break;

      case 'update-close':
        await window.electron.ipcRenderer.invoke('setAutoRunAppAfterInstall', false);
        await window.electron.ipcRenderer.invoke('quitAndInstallAppUpdate');
        break;

      case 'later':
      default:
        break;
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
}
