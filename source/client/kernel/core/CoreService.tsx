import { createRoot } from 'react-dom/client';
import { IApplicationListener } from 'mn-toolkit';
import { isString, logger } from 'mn-tools';
import { Page } from '../page';

type TUpdateChoice = 'update-restart' | 'update-close' | 'later';

const log = logger('$core');

const HOME_STATE = 'home';

export class CoreService implements Partial<IApplicationListener> {
  public async setup() {
    app.addListener(this);

    app.$store.configure({
      storeName: app.conf.dbName!,
      storeVersion: 1,
      nonMobileStore: 'indexedDB',
      storePrefix: app.conf.objectStoreName,
    });

    if (app.$device.isElectron(window)) {
      await window.electron.ipcRenderer.invoke('setAutoDownloadAppUpdate', true);
      await window.electron.ipcRenderer.invoke('setAutoInstallOnAppQuit', true);
      await window.electron.ipcRenderer.invoke('setAutoRunAppAfterInstall', true);

      window.electron.ipcRenderer.addListener('updateDownloaded', (info) =>
        app.$errorManager.handlePromise(this.showUpdateDialog(info))
      );

      window.electron.ipcRenderer.addListener('updateError', (error) => !!error && app.$errorManager.trigger(error));
    }

    return Promise.resolve();
  }

  private async showUpdateDialog(info: TElectronUpdateInfo | undefined) {
    if (!info || !app.$device.isElectron(window)) return;

    let message = '';

    // Add release notes if available
    if (info.releaseNotes) {
      if (isString(info.releaseNotes)) {
        message += `Notes de version :<br>${info.releaseNotes.replaceAll('\n\n', '<br>').replaceAll('\n', '<br>')}<br>`;
      } else if (Array.isArray(info.releaseNotes)) {
        const formattedNotes = info.releaseNotes.map((note) => (isString(note) ? note : note.note)).join('<br>');
        message += `Notes de version :<br>${formattedNotes}<br>`;
      }
    }

    // Add the default message
    message +=
      "<em>Si vous ne mettez pas à jour tout de suite, la mise à jour sera faite automatiquement à la fermeture de l'application.<em>";

    const choice = await app.$popup.choice<TUpdateChoice>({
      className: 'app-update-choice-popup',
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

  public gotoHome() {
    app.$router.go(HOME_STATE);
  }

  public applicationReady() {
    log.debug('applicationReady');
    const container = document.getElementById('root')!;
    const root = createRoot(container);
    root.render(<Page />);
    this.gotoHome();

    if (app.$device.isElectron(window)) {
      app.$errorManager.handlePromise(window.electron.ipcRenderer.invoke('checkForAppUpdates'));
    }
  }
}
