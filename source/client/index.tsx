import './index.scss';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SettingsService } from './settings';
import { setupAppAndToolkit } from 'libraries/mn-toolkit';
import { extendNativeObjects } from 'libraries/mn-tools';
import { CardService } from './card';
import { MediaWikiService } from './media-wiki';
import { YuginewsService } from './yuginews';

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
