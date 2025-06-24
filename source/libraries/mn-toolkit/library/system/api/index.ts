import { IJob, IRouteRecord } from 'api/main';
import { ApiService } from './ApiService';

export * from './ApiJob';
export * from './ApiService';

export interface IApiRequestOptions {
  headers?: { [key: string]: string };
}

export interface IApiSettings {
  apiUrl: string;
  router?: IRouteRecord[];
}

export interface IUploadDescriptor {
  fileBlob: Blob;
  offset: number;
  size: number;
  chunkIndex: number;
  chunkCount: number;
  targetFileId: number;
  appInstance: number;
}

export interface IApiListener {
  apiAlterHeaders: (headers: { [key: string]: string } | undefined) => void | Promise<void>;
  apiUploadProgress: (upload: IUploadDescriptor) => void | Promise<void>;

  apiJobStarted: (job: IJob<unknown>) => void | Promise<void>;
  apiJobProgress: (job: IJob<unknown>) => void | Promise<void>;
  apiJobFinished: (job: IJob<unknown>) => void | Promise<void>;
}

declare global {
  interface IAPI extends ApiService {}
  interface IApp {
    $api: IAPI;
  }
}
