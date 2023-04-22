/* eslint-disable no-undef */
/* eslint-disable import/order */
/* eslint-disable prettier/prettier */

import { createRoot } from 'react-dom/client';
import { Application } from 'mn-toolkit/bootstrap';
import App from './App';
import { ErrorManagerService } from 'mn-toolkit/error-manager';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);


(window as any).app = new Application();

app.service('$errorManager', ErrorManagerService);

app.bootstrap();
