import { IRouteRecord } from 'api/main';
import { ApiService } from './ApiService';
import { ApiJob } from './ApiJob';

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
  apiAlterHeaders(headers: { [key: string]: string }): void;
  apiUploadProgress(upload: IUploadDescriptor): void;

  apiJobStarted(job: ApiJob): void;
  apiJobProgress(job: ApiJob): void;
  apiJobFinished(job: ApiJob): void;
}

declare global {
  interface IAPI extends ApiService {}
  interface IApp {
    $api: IAPI;
  }
}
