import { extend, isDefined, isString, logger, Observable, parseUri } from 'mn-tools';
import { HttpMethod, IFileApiDownloadOptions, IFileEffect, IFileEntity, IJobResponse } from 'api/main';
import { IXhrRequestOptions } from '../xhr';
import { IApiListener, IApiRequestOptions, IApiSettings, IUploadDescriptor } from '.';
import { ApiJob } from './ApiJob';

interface IFileGetUrlOptions extends Omit<IFileApiDownloadOptions, 'oid' | 'effects' | 'instance'> {
  oid?: number;
  effects?: IFileEffect[];
  instance?: number;
}

const BYTES_PER_CHUNK = 1048576; // 1MB chunk sizes.

const log = logger('api');

export class ApiService extends Observable<IApiListener> {
  private _settings: IApiSettings;

  public constructor() {
    super();
    this._settings = {
      apiUrl: 'api',
      tokenKey: 'Token',
    };
  }

  public async setup() {
    this.configure({ apiUrl: app.conf.apiUrl!, router: app.conf.routerConfig! });
    return Promise.resolve();
  }

  public configure(options: IApiSettings) {
    extend(this._settings, options);
    if (this._settings.router) {
      this._settings.router.forEach((record) => {
        if (!record.className) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(this as any)[record.className]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this as any)[record.className] = {};
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as any)[record.className][record.methodName] = ((self, record) => {
          return async (data: object, options: IApiRequestOptions) => {
            const path = record.path.replace(/^\/api\//, '');
            const response = await self.post<object, { result: object }>(path, data, options);
            if (isDefined(response.result)) return response.result;
            return undefined;
          };
        })(this, record);

        if (record.methodName === 'list') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this as any)[record.className].list = ((self, record) => {
            return async (data: object, options: IApiRequestOptions) => {
              const path = record.path.replace(/^\/api\//, '');
              const response = await self.post<object, { result: object }>(path, data, options);
              if (response.result) return response.result;
              return undefined;
            };
          })(this, record);
        }
      });
    }
  }

  private async http<RES>(
    method: HttpMethod,
    path: string,
    requestData: { [k: string]: string },
    options?: IApiRequestOptions
  ) {
    options = options || {};
    let url: string;
    if (path.startsWith('http')) {
      url = path;
    } else if (path[0] === '/') {
      const parsedUrl = parseUri(this._settings.apiUrl);
      url = parsedUrl.protocol + '://' + parsedUrl.host + path;
    } else {
      url = this._settings.apiUrl + '/' + path;
    }
    const request: IXhrRequestOptions = {
      method: method.toUpperCase(),
      url,
      data: requestData,
      headers: {},
    };

    if ((options.sessionToken || (!options.noSessionToken && app.$session?.active)) && request.headers) {
      request.headers[this._settings.tokenKey!] = options.sessionToken || app.$session.token;
    }
    this.dispatch('apiAlterHeaders', request.headers);
    if (options.headers) {
      for (const key in options.headers) {
        if (request.headers) request.headers[key] = options.headers[key];
      }
    }
    log.debug('Envoi', request);
    const data = await app.$xhr.request(request);
    log.debug('Résultat', data);
    if (data.result && typeof data.result.job === 'object') {
      log.debug('Job', data.result.job);
      const job = new ApiJob((data.result as IJobResponse).job.id);
      app.$api.dispatch('apiJobStarted', job);
      const res = await job.wait<RES>();
      log.debug('Réponse Job', res);
      return { result: res };
    } else {
      log.debug('Réponse');
      return data;
    }
  }

  public async post<REQ = object, RES = object>(path: string, request: REQ, options?: IApiRequestOptions) {
    return await this.http<RES>('post', path, request as unknown as { [k: string]: string }, options);
  }

  public async put<REQ = object, RES = object>(path: string, request: REQ, options?: IApiRequestOptions) {
    return await this.http<RES>('put', path, request as unknown as { [k: string]: string }, options);
  }

  public async get<REQ = object, RES = object>(path: string, request?: REQ, options?: IApiRequestOptions) {
    return await this.http<RES>('get', path, request as unknown as { [k: string]: string }, options);
  }

  public async del<REQ = object, RES = object>(path: string, request: REQ, options?: IApiRequestOptions) {
    return this.http<RES>('delete', path, request as unknown as { [k: string]: string }, options);
  }

  public async fileToDataURL(file?: File): Promise<string> {
    if (!file) return '';
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result;
        if (isString(result)) {
          resolve(result);
        } else {
          reject(new Error('Unexpected result type'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsDataURL(file);
    });
  }

  public async fileToString(file: File): Promise<string> {
    if (!file) return '';
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Unexpected result type'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsText(file);
    });
  }

  public async uploadFileToFile(fileBlob: File, file: number, appInstance: number) {
    const ud: IUploadDescriptor = {
      fileBlob,
      offset: 0,
      size: fileBlob.size,
      appInstance,
      chunkIndex: 0,
      chunkCount: Math.ceil(fileBlob.size / BYTES_PER_CHUNK),
      targetFileId: file,
    };
    this.dispatch('apiUploadProgress', ud);
    await this.uploadNextChunk(ud);
  }

  private async uploadNextChunk(ud: IUploadDescriptor) {
    const chunkData = ud.fileBlob.slice(ud.offset, ud.offset + BYTES_PER_CHUNK);
    log.debug('chunk', ud.fileBlob.size, ud.offset, BYTES_PER_CHUNK, chunkData.size);
    ud.chunkIndex++;

    return new Promise<void>((resolve) => {
      const fd = new FormData();
      fd.append('chunkData', chunkData);
      fd.append('chunkCount', ud.chunkCount.toString());
      fd.append('targetFileId', `${ud.targetFileId}`);
      ud.offset = ud.offset + BYTES_PER_CHUNK;

      this.dispatch('apiUploadProgress', ud);

      const xhr = new XMLHttpRequest();

      xhr.addEventListener(
        'load',
        () => {
          // On a fini, on part...
          if (ud.offset > ud.size) return resolve();

          // Sinon on upload le suivant...
          this.uploadNextChunk(ud)
            .then(() => resolve())
            .catch((e: Error) => app.$errorManager.trigger(e));
        },
        false
      );

      xhr.upload.addEventListener('progress', (_event) => {}, false);
      xhr.addEventListener('error', (_event) => {}, false);
      xhr.addEventListener('abort', (_event) => {}, false);
      const postUrl = `${this._settings.apiUrl}/file/upload/${ud.appInstance}`;
      xhr.open('POST', postUrl);
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('token', app.$session.token);

      log.debug(chunkData.size, postUrl);
      xhr.send(fd);
    });
  }

  // Le paramètre timestamp permet de forcer un rafraichissement de l'image si l'url ne change pas
  // Utile quand on recadre une photo par exemple
  // A éviter de mettre à jour à chaque render, sinon ça requête l'image à nouveau à chaque fois
  // Uniquement quand il y a un sens à vouloir rafraichir l'image affichée
  public getFileUrl(options: IFileGetUrlOptions) {
    let { oid, derivative, effects, timestamp, instance } = options;
    if (!oid) return undefined;

    instance = instance || app.$session.data?.member?.applicationInstance || 1;

    const url = new URL(`${this._settings.apiUrl}/file/download/${instance}/${oid}`);
    url.searchParams.set('token', app.$session.token);

    if (derivative) url.searchParams.set('derivative', derivative);

    if (effects?.length) {
      url.searchParams.set('effects', this.encodeArrayToBase64<IFileEffect>(effects));
    }

    if (timestamp) url.searchParams.set('timestamp', timestamp);

    return url.toString();
  }

  private encodeArrayToBase64<T>(array: T[]): string {
    const jsonString = JSON.stringify(array);
    const bytes = new TextEncoder().encode(jsonString);
    const base64String = window.btoa(String.fromCharCode(...bytes));
    return base64String;
  }

  public fileStreamUrl(oid: number, appInstance: number) {
    if (!oid || !appInstance) return undefined;
    return `${this._settings.apiUrl}/file/stream/${appInstance}/${oid}?token=${app.$session.token}`;
  }

  public async createFileFromFile(fileBlob: File) {
    const file = await app.$api.file.store({ mimeType: fileBlob.type, fileName: fileBlob.name });
    await this.uploadFileToFile(fileBlob, file.oid, file.applicationInstance);
    return file;
  }

  public async createFileFromDataUrl(data: string, spec?: Partial<IFileEntity>) {
    return await app.$api.file.createFromDataUrl({ data, spec });
  }
}
