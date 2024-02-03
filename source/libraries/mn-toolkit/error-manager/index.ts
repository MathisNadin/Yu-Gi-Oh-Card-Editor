import { isArray } from 'libraries/mn-tools';
import { ErrorManagerService } from './ErrorManagerService';

export * from './ErrorManagerService';

window.$oldErrorManager = window.console.error;
window.$errorManager = (...args: any[]) => {
  window.$oldErrorManager.apply(window.console, args);
};
window.console.error = (args: [Error]) => {
  window.$errorManager.apply(window.console, isArray(args) ? args : [args]);
};

window.addEventListener('error', (evt: Event) => {
  window.$errorManager((evt as any).error);
  evt.preventDefault();
});

declare global {
  interface Window {
    $oldErrorManager: any;
    $errorManager: (error?: Error) => void;
  }

  interface IApp {
    $errorManager: ErrorManagerService;
  }
}
