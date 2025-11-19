import { isArray } from 'mn-tools';
import { ErrorManagerService } from './ErrorManagerService';

export * from './ErrorManagerService';

window.$oldErrorManager = window.console.error;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.$errorManager = (...args: any[]) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  window.$oldErrorManager.apply(window.console, args);
};
window.console.error = (args: [Error]) => {
  window.$errorManager.apply(window.console, isArray(args) ? args : [args]);
};

window.addEventListener('error', (evt: Event & { error?: Error }) => {
  window.$errorManager(evt.error);
  evt.preventDefault();
});

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $oldErrorManager: any;
    $errorManager: (error?: Error) => void;
  }

  interface IApp {
    $errorManager: ErrorManagerService;
  }
}
