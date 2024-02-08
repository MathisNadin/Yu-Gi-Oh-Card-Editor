export * from './XhrService';

export interface IXhrRequestOptions {
  method: string;
  url: string;
  data?: { [k: string]: string };
  timeout?: number;
  binary?: boolean;
  headers?: { [name: string]: string };
  withCredentials?: boolean;
}

export interface IXhrProgress {
  id: string;
  total: number;
  progress: number;
}

export interface IXhrListener {
  xhrStart(requestId: string): void;
  xhrStop(requestId: string): void;
  xhrError(requestId: string, statusCode: number, url?: string): void;
  xhrProgress(requestId: string, progress: IXhrProgress): void;
}

import { XhrService } from './XhrService';

declare global {
  interface IApp {
    $xhr: XhrService;
  }
}
