/* eslint-disable no-undef */
/* eslint-disable import/order */
/* eslint-disable prettier/prettier */

import { createRoot } from 'react-dom/client';
import { Application } from 'mn-toolkit/bootstrap';
import App from './App';
import { ErrorManagerService } from 'mn-toolkit/error-manager';
import { IndexedDBService } from 'mn-toolkit/indexedDB/IndexedDBService';
import { CardService } from './card/CardService';
import { ApiService } from 'mn-toolkit/api/ApiService';
import { MediaWikiService } from 'mn-toolkit/media-wiki/MediaWikiService';

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

app.service('$errorManager', ErrorManagerService);
app.service('$indexedDB', IndexedDBService);
app.service('$api', ApiService);
app.service('$mediaWiki', MediaWikiService);
app.service('$card', CardService);

app.bootstrap();

window.electron.ipcRenderer.on('render-current-card', async () => {
  await app.$card.renderCurrentCard();
});

window.electron.ipcRenderer.on('save-current-or-temp-to-local', async () => {
  await app.$card.saveCurrentOrTempToLocal();
});

window.electron.ipcRenderer.on('delete-local-db', async () => {
  await app.$indexedDB.deleteAll();
});
