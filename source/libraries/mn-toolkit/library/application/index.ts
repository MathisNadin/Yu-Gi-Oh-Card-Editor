import { Application } from './Application';

export * from './Application';

declare global {
  interface IApp extends Application {}
  // eslint-disable-next-line vars-on-top, no-var
  var app: IApp;

  interface IVendors {}

  interface Window {
    vendors: IVendors;
    app: IApp;
  }

  interface EventTarget {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
  }
}

export type TID = number | string;
