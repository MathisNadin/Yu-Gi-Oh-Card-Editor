import { unserialize, uuid, each, serialize } from 'libraries/mn-tools';
import { IXhrListener, IXhrProgress, IXhrRequestOptions, Observable } from '..';

declare global {
  interface XMLHttpRequest {
    $id: string;
    $uploadProgress: IXhrProgress,
    $downloadProgress: IXhrProgress
    $url: string;
  }

  interface ActiveXObject {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (s: string): any;
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

export function isXhrError(value: Error): value is XhrError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof (value as any).statusCode !== 'undefined';
}

/**
 * This class manage the XHR communication with the server.
 *
 * @memberOf $xhr
 */
export class XhrService extends Observable<IXhrListener> {

  private fireStart(requestId: string) { this.dispatch('xhrStart', requestId); }
  private fireStop(requestId: string) { this.dispatch('xhrStop', requestId); }
  private fireError(requestId: string, statusCode: number, url: string) { this.dispatch('xhrError', requestId, statusCode, url); }
  private fireProgress(requestId: string, progress: IXhrProgress) { this.dispatch('xhrProgress', requestId, progress); }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async request(options: IXhrRequestOptions): Promise<any> {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Promise<any>((resolve, reject) => {
      options.timeout = options.timeout || 0;
      options.binary = options.binary || false;
      options.headers = options.headers || {};

      let request!: XMLHttpRequest;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (window as any).XMLHttpRequest !== 'undefined') {
        request = new XMLHttpRequest();
      } else {
        let versions = ["MSXML2.XmlHttp.5.0", "MSXML2.XmlHttp.4.0", "MSXML2.XmlHttp.3.0", "MSXML2.XmlHttp.2.0", "Microsoft.XmlHttp"];

        for (let i = 0, len = versions.length; i < len; i++) {
          try {
            request = new ActiveXObject(versions[i]);
            break;
          } catch (e) { }
        }
      }
      if (typeof request === 'undefined') return reject(new XhrError('No XHR'));

      if (options.binary) request.responseType = "arraybuffer";

      let url = options.url;
      if (options.method === 'GET') {
        let pairs = [];
        for (let key in options.data) {
          pairs.push(key + '=' + encodeURIComponent(options.data[key]));
        }
        if (pairs.length) {
          url += '?' + pairs.join('&');
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
        request.ontimeout = () => reject('timeout');
      }

      request.upload.addEventListener('progress', event => {
        let total = event.total || parseInt(request.getResponseHeader('Data-Size') as string, 10);
        if (total && event.loaded < total) {
          request.$uploadProgress = {
            id: request.$id,
            total: total,
            progress: event.loaded
          };
          this.fireProgress(request.$id, request.$uploadProgress);
        }
      }, false);

      request.addEventListener('progress', event => {
        let total = event.total || parseInt(request.getResponseHeader('Data-Size') as string, 10);
        if (total && event.loaded < total) {
          request.$downloadProgress = { id: request.$id, total: total, progress: event.loaded };
          this.fireProgress(request.$id, request.$downloadProgress);
        }
      }, false);


      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let self = this;
      request.onreadystatechange = function () {
        if (this.readyState === this.DONE) {
          if (this.status !== 200) {
            self.fireError(request.$id, this.status, request.$url);
            return reject(new XhrError(`Status HTTP Code ${this.status}`, this.status));
          } else {
            self.fireStop(request.$id);
            let data = this.response;
            try {
              let contentType = this.getResponseHeader('content-type') as string;
              let tokens = contentType.split(/\s*;\s*/);
              if (tokens[0] === 'application/json') {

                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                data = unserialize(data);
              }
            } catch (e) {
              return reject(e);
            }
            return resolve(data);
          }
        }
      };
      this.fireStart(request.$id);
      let data;
      if (options.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
        let pairs = [];
        for (let key in options.data) {
          pairs.push(key + '=' + encodeURIComponent(options.data[key]));
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
