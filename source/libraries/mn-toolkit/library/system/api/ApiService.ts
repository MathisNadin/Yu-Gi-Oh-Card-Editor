import { extend, isDefined, isString, logger, AbstractObservable, parseUri, serialize, formatFileSize } from 'mn-tools';
import { THttpMethod, IFileApiDownloadOptions, IFileEffect, IFileEntity, ISessionEntity } from 'api/main';
import { IXhrRequestOptions } from '../xhr';
import { IApiListener, IApiRequestOptions, IApiSettings, IUploadDescriptor } from '.';

type TApiMethod = (data: object, options: IApiRequestOptions) => Promise<unknown>;
type TApiGroup = Record<string, TApiMethod>;

interface IFileGetUrlOptions extends Omit<IFileApiDownloadOptions, 'oid' | 'effects' | 'instance'> {
  oid?: IFileEntity['oid'];
  effects?: IFileEffect[];
  instance?: IFileEntity['applicationInstance'];
  token?: ISessionEntity['token'];
}

const BYTES_PER_CHUNK = 1_048_576; // 1MB chunk sizes.

const log = logger('api');

export class ApiService extends AbstractObservable<IApiListener> {
  private _settings: IApiSettings;

  public constructor() {
    super();
    this._settings = {
      apiUrl: 'api',
    };
  }

  public async setup() {
    this.configure({ apiUrl: app.conf.apiUrl!, router: app.conf.routerConfig! });
    return Promise.resolve();
  }

  public configure(options: IApiSettings) {
    extend(this._settings, options);

    const routerRecords = this._settings.router;
    if (!routerRecords) return;

    const apiGroups = this as unknown as Record<string, TApiGroup>;

    for (const record of routerRecords) {
      if (!record.className) continue;

      const className = record.className;
      const methodName = record.methodName;

      if (!apiGroups[className]) {
        apiGroups[className] = {} as TApiGroup;
      }

      const group = apiGroups[className];

      const createMethod = (self: ApiService, r: typeof record): TApiMethod => {
        return async (data: object, options: IApiRequestOptions) => {
          const path = r.path.replace(/^\/api\//, '');
          const response = await self.post<object, { result: unknown }>(path, data, options);
          if (isDefined(response.result)) return response.result;
          return undefined;
        };
      };

      group[methodName] = createMethod(this, record);

      if (methodName === 'list') {
        const createListMethod = (self: ApiService, r: typeof record): TApiMethod => {
          return async (data: object, options: IApiRequestOptions) => {
            const path = r.path.replace(/^\/api\//, '');
            const response = await self.post<object, { result: unknown }>(path, data, options);
            if (isDefined(response.result)) return response.result;
            return undefined;
          };
        };

        group.list = createListMethod(this, record);
      }
    }
  }

  private async http<RES>(
    method: THttpMethod,
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

    await this.dispatchAsync('apiAlterHeaders', request.headers);
    if (options.headers) {
      for (const key in options.headers) {
        if (request.headers) request.headers[key] = options.headers[key]!;
      }
    }
    log.debug('Envoi', request);
    const data = await app.$xhr.request<RES>(request);
    log.debug('Résultat', data);
    return data;
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

  public async fileToString(file: File | undefined): Promise<string> {
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
    if (app.conf.maxFileUploadSize && fileBlob.size > app.conf.maxFileUploadSize) {
      throw new Error(
        `Ce fichier dépasse la taille maximale autorisée (${formatFileSize(app.conf.maxFileUploadSize)}).`
      );
    }
    const ud: IUploadDescriptor = {
      fileBlob,
      offset: 0,
      size: fileBlob.size,
      appInstance,
      chunkIndex: 0,
      chunkCount: Math.ceil(fileBlob.size / BYTES_PER_CHUNK),
      targetFileId: file,
    };
    await this.dispatchAsync('apiUploadProgress', ud);
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
      ud.offset = ud.offset + BYTES_PER_CHUNK;

      app.$errorManager.handlePromise(this.dispatchAsync('apiUploadProgress', ud));

      const xhr = new XMLHttpRequest();

      xhr.addEventListener(
        'load',
        () => {
          // We're done, leaving...
          if (ud.offset > ud.size) return resolve();

          // Otherwise, upload next chunk...
          this.uploadNextChunk(ud)
            .then(() => resolve())
            .catch((e: Error) => app.$errorManager.trigger(e));
        },
        false
      );

      xhr.upload.addEventListener('progress', (_event) => {}, false);
      xhr.addEventListener('error', (_event) => {}, false);
      xhr.addEventListener('abort', (_event) => {}, false);
      const postUrl = `${this._settings.apiUrl}/file/upload/${ud.appInstance}/${ud.targetFileId}/`;
      xhr.open('POST', postUrl);
      xhr.setRequestHeader('Cache-Control', 'no-cache');

      log.debug(chunkData.size, postUrl);
      xhr.send(fd);
    });
  }

  // Le paramètre timestamp permet de forcer un rafraichissement de l'image si l'url ne change pas
  // Utile quand on recadre une photo par exemple
  // A éviter de mettre à jour à chaque render, sinon ça requête l'image à nouveau à chaque fois
  // Uniquement quand il y a un sens à vouloir rafraichir l'image affichée
  public getFileUrl(options: IFileGetUrlOptions) {
    let { oid, derivative, effects, timestamp, instance, token } = options;
    if (!oid) return undefined;

    instance = instance || app.$session.data?.member?.applicationInstance || 1;

    const url = new URL(`${this._settings.apiUrl}/file/download/${instance}/${oid}/`);
    if (token) url.searchParams.set('token', token);

    if (derivative) url.searchParams.set('derivative', derivative);

    if (effects?.length) {
      url.searchParams.set('effects', this.encodeArrayToBase64<IFileEffect>(effects));
    }

    if (timestamp) url.searchParams.set('timestamp', timestamp);

    return url.toString();
  }

  private encodeArrayToBase64<T>(array: T[]): string {
    const jsonString = serialize(array);
    const bytes = new TextEncoder().encode(jsonString);
    const base64String = window.btoa(String.fromCharCode(...bytes));
    return base64String;
  }

  public getFileStreamUrl(options: {
    oid: IFileEntity['oid'];
    instance?: IFileEntity['applicationInstance'];
    token?: ISessionEntity['token'];
  }) {
    let { oid, instance, token } = options;
    if (!oid) return undefined;

    instance = instance || app.$session.data?.member?.applicationInstance || 1;

    const url = new URL(`${this._settings.apiUrl}/file/stream/${instance}/${oid}/`);
    if (token) url.searchParams.set('token', token);

    return url.toString();
  }

  public async createFileFromFile(fileBlob: File, spec: Partial<IFileEntity> = {}) {
    spec.fileName = spec.fileName || fileBlob.name;
    spec.mimeType = spec.mimeType || fileBlob.type;
    const file = await app.$api.file.store(spec);
    await this.uploadFileToFile(fileBlob, file.oid, file.applicationInstance);
    return file;
  }

  public async createFileFromDataUrl(data: string, spec?: Partial<IFileEntity>) {
    return await app.$api.file.createFromDataUrl({ data, spec });
  }
}
