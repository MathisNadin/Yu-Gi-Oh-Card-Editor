/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import { ErrorManagerService } from './ErrorManagerService';

export * from './ErrorManagerService';

/* window.$oldErrorManager = window.console.error;
window.$errorManager = (...args: any[]) => {
  window.$oldErrorManager.apply(window.console, [args]);
};
window.console.error = (args: [Error]) => {
  window.$errorManager.apply(window.console, args);
};

window.addEventListener('error', (evt: Event) => {
  window.$errorManager((evt as any).error);
  evt.preventDefault();
}); */

export interface IExceptionEvent {
  source?: {
    name: string;
    version: string;
  };
  error?: {
    message: string;
    stack: string;
  };
}

declare global {
  interface Window {
    $oldErrorManager: any;
    $errorManager: (error?: Error) => void;
  }

  interface IApp {
    $errorManager: ErrorManagerService;
  }
}
