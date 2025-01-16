import { isDefined, serialize, unserialize } from 'mn-tools';
import { IStoreOptions, IStoreService, TStoreValue } from '.';

export class IndexedDBService implements IStoreService {
  private options: IStoreOptions;
  private db!: IDBDatabase;

  public get objectStoreName() {
    return this.options.storePrefix || `${this.options.storeName}-object-store`;
  }

  public constructor(options: IStoreOptions) {
    this.options = options;
  }

  public async setup() {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.options.storeName, this.options.storeVersion);
      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
        db.createObjectStore(this.objectStoreName);
      };
    });

    if (app.$device.isElectron(window)) {
      window.electron.ipcRenderer.addListener('deleteLocalDb', () => app.$errorManager.handlePromise(this.clear()));
    }
  }

  public async set<T extends TStoreValue = TStoreValue, K extends string = string>(key: K, value: T) {
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([this.objectStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.objectStoreName);
      const request = objectStore.put(value, key);
      request.onerror = () => {
        reject(new Error(`Failed to put object with key ${key}`));
      };
      request.onsuccess = () => {
        resolve();
      };
    });
  }

  public async get<T extends TStoreValue, K extends string = string>(key: K, defaultValue?: T) {
    return await new Promise<T>((resolve, reject) => {
      const transaction = this.db!.transaction([this.objectStoreName]);
      const objectStore = transaction.objectStore(this.objectStoreName);
      const request = objectStore.get(key);
      request.onerror = () => {
        reject(new Error(`Failed to get object with key ${key}`));
      };
      request.onsuccess = () => {
        resolve(isDefined(request.result) ? request.result : defaultValue);
      };
    });
  }

  public async remove<K extends string>(key: K) {
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([this.objectStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.objectStoreName);
      const request = objectStore.delete(key);
      request.onerror = () => {
        reject(new Error(`Failed to delete object with key ${key}`));
      };
      request.onsuccess = () => {
        resolve();
      };
    });
  }

  public async clear() {
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([this.objectStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.objectStoreName);
      const request = objectStore.clear();
      request.onerror = () => {
        reject(new Error('Failed to clear object store'));
      };
      request.onsuccess = () => {
        resolve();
      };
    });
  }

  public async importData(jsonData: string) {
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([this.objectStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.objectStoreName);
      const data = unserialize(jsonData);
      const clearRequest = objectStore.clear();
      clearRequest.onerror = () => {
        reject(new Error(`Failed to clear object store ${this.objectStoreName}`));
      };
      clearRequest.onsuccess = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.forEach((obj: any) => {
          const putRequest = objectStore.put(obj);
          putRequest.onerror = () => {
            reject(new Error(`Failed to put object with key ${obj.key}`));
          };
          putRequest.onsuccess = () => {
            resolve();
          };
        });
      };
    });
  }

  public async exportData() {
    return new Promise<string>((resolve, reject) => {
      const transaction = this.db!.transaction([this.objectStoreName]);
      const objectStore = transaction.objectStore(this.objectStoreName);
      const request = objectStore.getAll();
      request.onerror = () => {
        reject(new Error(`Failed to get all objects from object store ${this.objectStoreName}`));
      };
      request.onsuccess = () => {
        const data = request.result;
        const jsonData = serialize(data);
        resolve(jsonData);
      };
    });
  }
}
