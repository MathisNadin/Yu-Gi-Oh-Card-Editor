import { IRouteRecord } from 'api/main';
import { Application } from './Application';

export * from './Application';

declare global {
  interface IApp extends Application {}

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
    readonly name: string;
    readonly displayName: string;
    readonly stage: TApplicationStage;
    readonly version: string;
    readonly baseUrl: string;
    readonly apiUrl?: string;
    readonly routerConfig?: IRouteRecord[];
    readonly dbName?: string;
    readonly objectStoreName?: string;
    /** In octets (bytes) */
    readonly maxFileUploadSize?: number;
    readonly debug?: boolean;
  }
}

export type TID = number | string;
