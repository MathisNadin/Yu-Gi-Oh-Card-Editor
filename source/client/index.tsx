import { createRoot } from 'react-dom/client';
import App from './App';
import { CardService } from './card/CardService';
import { MediaWikiService } from '../media-wiki/MediaWikiService';
import { YuginewsService } from './yuginews/YuginewsService';
import { extendNativeObjects } from 'libraries/mn-tools/patch';
import { setupAppAndToolkit } from 'libraries/mn-toolkit/index';
import { SettingsService } from './settings';

extendNativeObjects();

setupAppAndToolkit(
  {
    dbName: 'card-editor-db',
    objectStoreName: 'card-editor-object-store',
  },
  () => {
    app.service('$settings', SettingsService, { depends: ['$indexedDB'] });
    app.service('$mediaWiki', MediaWikiService, { depends: ['$api'] });
    app.service('$card', CardService, { depends: ['$indexedDB'] });
    app.service('$yuginews', YuginewsService, { depends: ['$api'] });
  }
);




const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);



window.electron.ipcRenderer.on('render-current-card', async () => {
  await app.$card.renderCurrentCard();
});

window.electron.ipcRenderer.on('save-current-or-temp-to-local', async () => {
  await app.$card.saveCurrentOrTempToLocal();
});

window.electron.ipcRenderer.on('import-cards', async () => {
  await app.$card.showImportDialog();
});

window.electron.ipcRenderer.on('import-data', async () => {
  await app.$settings.importData();
});

window.electron.ipcRenderer.on('export-data', async () => {
  await app.$settings.exportData();
});

window.electron.ipcRenderer.on('delete-local-db', async () => {
  await app.$indexedDB.deleteAll();
});
