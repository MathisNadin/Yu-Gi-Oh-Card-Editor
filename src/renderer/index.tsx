import { createRoot } from 'react-dom/client';
import App from './App';
import { CardService } from './card/CardService';
import { MediaWikiService } from 'renderer/media-wiki/MediaWikiService';
import { ICardImportDialogResult, CardImportDialog } from './card-import-dialog/CardImportDialog';
import { YuginewsService } from './yuginews/YuginewsService';
import { extendNativeObjects } from 'libraries/mn-tools/patch';
import { setupAppAndToolkit } from 'libraries/mn-toolkit/index';

extendNativeObjects();

setupAppAndToolkit(() => {
  app.service('$mediaWiki', MediaWikiService);
  app.service('$card', CardService);
  app.service('$yuginews', YuginewsService);
});



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
