import { deepClone } from 'mn-tools';
import { Component } from 'react';

// let log = logger('$errorManager');

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

export interface IErrorManagerDelegator {
  getErrorManagerBaseException(): IExceptionEvent;
}

interface IOptions {
  apiUrl: string;
  source?: string;
  version?: string;
}

export class ErrorManagerService {
  private delegators: IErrorManagerDelegator[] = [];
  private options: IOptions;
  private inProcess = false;

  public constructor() {
    this.options = undefined as unknown as IOptions;
    this.inProcess = false;
  }

  public configure(options: IOptions) {
    this.options = options;
  }

  public register(delegator: IErrorManagerDelegator) {
    this.delegators.push(delegator);
  }

  public initialize() {
    // console.log('initialize');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.$errorManager = (error?: Error, component?: Component<object, object, any>) => {
      if (error) {
        this.trigger(error, component);
      }
    };
  }

  public trigger(error: Error, component?: Component) {
    if (component) {
      // app.$toaster.pop(error.message);
      component.setState({ loading: false });
    }
    window.$oldErrorManager.call(window.console, error);
    if (!this.options || !this.options.apiUrl) {
      window.$oldErrorManager('$errorManager not connected');
      return;
    }
    if (typeof error === 'string') error = new Error(error);
    if (this.inProcess) return;
    this.inProcess = true;

    let event!: IExceptionEvent;
    this.delegators.forEach((d) => {
      event = d.getErrorManagerBaseException();
      return false;
    });
    event = event || ({} as unknown as IExceptionEvent);
    event = deepClone(event);
    event.source = {
      name: this.options.source as string,
      version: this.options.version as string,
    };
    event.error = {
      message: error.message,
      stack: error.stack ? error.stack.toString() : '',
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public handlePromise(result: Promise<any> | any) {
    // eslint-disable-next-line no-console
    if (result instanceof Promise) result.catch((e: Error) => console.error(e));
  }
}
