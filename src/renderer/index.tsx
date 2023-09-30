import { createRoot } from 'react-dom/client';
import { Application } from 'libraries/mn-toolkit/bootstrap';
import App from './App';
import { ErrorManagerService } from 'libraries/mn-toolkit/error-manager';
import { IndexedDBService } from 'libraries/mn-toolkit/indexedDB/IndexedDBService';
import { CardService } from './card/CardService';
import { ApiService } from 'libraries/mn-toolkit/api/ApiService';
import { MediaWikiService } from 'renderer/media-wiki/MediaWikiService';
import { PopupService } from 'libraries/mn-toolkit/popup/PopupService';
import { ICardImportDialogResult, CardImportDialog } from './card-import-dialog/CardImportDialog';
import { YuginewsService } from './yuginews/YuginewsService';
import { extendNativeObjects } from 'libraries/mn-tools/patch';

extendNativeObjects();

interface IAppSettings {
  dbName: string;
  objectStoreName: string;
}

declare global {
  interface IApp {
    settings: IAppSettings;
  }
}

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);


window.app = new Application() as IApp;

app.settings = {
  dbName: 'card-editor-db',
  objectStoreName: 'card-editor-object-store',
}

app.service('$errorManager', ErrorManagerService);
app.service('$popup', PopupService);
app.service('$indexedDB', IndexedDBService);
app.service('$api', ApiService);
app.service('$mediaWiki', MediaWikiService);
app.service('$card', CardService);
app.service('$yuginews', YuginewsService);

app.bootstrap();

window.electron.ipcRenderer.on('render-current-card', async () => {
  await app.$card.renderCurrentCard();
});

window.electron.ipcRenderer.on('save-current-or-temp-to-local', async () => {
  await app.$card.saveCurrentOrTempToLocal();
});

window.electron.ipcRenderer.on('import-cards', async () => {
  await app.$popup.show<ICardImportDialogResult>({
    id: 'import-popup',
    title: "Importez une carte",
    innerHeight: 'auto',
    innerWidth: '70%',
    content: <CardImportDialog />
  });
});

window.electron.ipcRenderer.on('import-data', async () => {
  await app.$card.importData();
});

window.electron.ipcRenderer.on('export-data', async () => {
  await app.$card.exportData();
});

window.electron.ipcRenderer.on('delete-local-db', async () => {
  await app.$indexedDB.deleteAll();
});
