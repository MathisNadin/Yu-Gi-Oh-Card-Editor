/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { Application } from './Application';

/* export interface IApplicationListener {
  applicationReady(): void;
} */

// declare module 'an-react' {
//   export interface VNode<P = {}> {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     attributes: {[key: string]: any};
//   }
// }

export * from './Application';

declare global {
  interface IApp extends Application {

  }
  // eslint-disable-next-line vars-on-top, no-var
  var app: IApp;

  // function require(name: string): any;

  interface IVendors {
  }

  interface Window {
    vendors: IVendors;
  }

  interface EventTarget {
    value: any;
  }
}

export type IID = number | string;
