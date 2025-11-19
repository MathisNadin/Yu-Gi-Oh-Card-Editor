import { AbstractObservable, unserialize, uuid, each, serialize, isDefined, isString, normalizeError } from 'mn-tools';
import { IXhrListener, IXhrProgress, IXhrRequestOptions } from '.';

declare global {
  interface XMLHttpRequest {
    $id: string;
    $uploadProgress: IXhrProgress;
    $downloadProgress: IXhrProgress;
    $url: string;
  }

  interface ActiveXObject {
    new (s: string): XMLHttpRequest;
  }
}

// eslint-disable-next-line no-var
declare var ActiveXObject: ActiveXObject;

export class XhrError extends Error {
  public statusCode: number;
  public constructor(m: string, statusCode?: number) {
    super(m);
    this.statusCode = statusCode as number;
  }
}

/**
 * This class manage the XHR communication with the server.
 *
 * @memberOf $xhr
 */
export class XhrService extends AbstractObservable<IXhrListener> {
  public async request<RES>(options: IXhrRequestOptions): Promise<RES> {
    return new Promise<RES>((resolve, reject) => {
      options.timeout = options.timeout || 0;
      options.binary = options.binary || false;
      options.headers = options.headers || {};

      let request: XMLHttpRequest | undefined;
      if (isDefined(window.XMLHttpRequest)) {
        request = new XMLHttpRequest();
      } else {
        const versions = [
          'MSXML2.XmlHttp.5.0',
          'MSXML2.XmlHttp.4.0',
          'MSXML2.XmlHttp.3.0',
          'MSXML2.XmlHttp.2.0',
          'Microsoft.XmlHttp',
        ];

        for (let i = 0, len = versions.length; i < len; i++) {
          try {
            request = new ActiveXObject(versions[i]!);
            break;
          } catch (e) {
            app.$errorManager.trigger(e as Error);
          }
        }
      }
      if (typeof request === 'undefined') return reject(new XhrError('No XHR'));

      if (options.binary) request.responseType = 'arraybuffer';

      let url = options.url;
      if (options.method === 'GET') {
        let pairs = [];
        for (let key in options.data) {
          pairs.push(`${key}=${encodeURIComponent(options.data[key]!)}`);
        }
        if (pairs.length) {
          url += `?${pairs.join('&')}`;
        }
      }
      request.open(options.method, url, true);
      request.$url = url;
      if (options.withCredentials) request.withCredentials = true;
      options.headers = options.headers || {};
      // we don't set content type as multipart/form-data"
      // because it's handled (correctly, with boundaries) by
      // the browser itself
      if (!(options.data instanceof FormData)) {
        options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json;charset=utf-8';
      }

      if (options.headers) {
        each(options.headers, (value: string, key: string) => {
          request.setRequestHeader(key, value);
        });
      }

      if (options.timeout) {
        request.timeout = options.timeout;
        request.ontimeout = () => reject(new Error('timeout'));
      }

      request.upload.addEventListener(
        'progress',
        (event) => {
          let total = event.total || parseInt(request.getResponseHeader('Data-Size') as string, 10);
          if (total && event.loaded < total) {
            request.$uploadProgress = {
              id: request.$id,
              total: total,
              progress: event.loaded,
            };
            app.$errorManager.handlePromise(this.dispatchAsync('xhrProgress', request.$id, request.$uploadProgress));
          }
        },
        false
      );

      request.addEventListener(
        'progress',
        (event) => {
          let total = event.total || parseInt(request.getResponseHeader('Data-Size') as string, 10);
          if (total && event.loaded < total) {
            request.$downloadProgress = { id: request.$id, total: total, progress: event.loaded };
            app.$errorManager.handlePromise(this.dispatchAsync('xhrProgress', request.$id, request.$downloadProgress));
          }
        },
        false
      );

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let self = this;
      request.onreadystatechange = function () {
        if (this.readyState === this.DONE) {
          if (this.status !== 200) {
            app.$errorManager.handlePromise(self.dispatchAsync('xhrError', request.$id, this.status, request.$url));
            return reject(new XhrError(`Status HTTP Code ${this.status}`, this.status));
          } else {
            app.$errorManager.handlePromise(self.dispatchAsync('xhrStop', request.$id));
            let data = this.response as unknown;
            try {
              let contentType = this.getResponseHeader('content-type') || '';
              let tokens = contentType.split(/\s*;\s*/);
              if (tokens[0] === 'application/json' && isString(data)) {
                data = unserialize(data);
              }
            } catch (e) {
              return reject(normalizeError(e));
            }
            return resolve(data as RES);
          }
        }
      };
      app.$errorManager.handlePromise(this.dispatchAsync('xhrStart', request.$id));
      let data;
      if (options.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
        const pairs = [];
        for (const key in options.data) {
          pairs.push(`${key}=${encodeURIComponent(options.data[key]!)}`);
        }
        data = pairs.join('&');
      } else if (options.data instanceof FormData) {
        data = options.data;
      } else {
        data = options.data ? serialize(options.data) : null;
      }
      request.$id = uuid();
      request.send(data);
      return request.$id;
    });
  }
}
