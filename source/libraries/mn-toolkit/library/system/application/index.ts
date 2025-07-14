import { IRouteRecord } from 'api/main';
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

  interface IApplicationStage {
    development: null;
    integration: null;
    preProduction: null;
    production: null;
  }
  type TApplicationStage = keyof IApplicationStage;

  interface IApplicationConfig {
    name: string;
    displayName: string;
    stage: TApplicationStage;
    version: string;
    baseUrl: string;
    apiUrl?: string;
    routerConfig?: IRouteRecord[];
    dbName?: string;
    objectStoreName?: string;
    debug?: boolean;
  }
}

export type TID = number | string;
