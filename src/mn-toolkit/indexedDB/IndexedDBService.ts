/* eslint-disable prettier/prettier */
/* eslint-disable lines-between-class-members */
/* eslint-disable import/prefer-default-export */

import { Observable } from "mn-toolkit/observable/Observable";

export interface IIndexedDBListener {
  allDeleted: () => void;
  dataImported: () => void;
}

export class IndexedDBService extends Observable<IIndexedDBListener> {
  private dbName: string;
  private dbVersion: number;
  private objectStoreName: string;
  private db: IDBDatabase | null = null;

  public constructor() {
    super();
    this.dbName = 'card-editor-db';
    this.dbVersion = 1;
    this.objectStoreName = 'card-editor-object-store';
  }

  public fireAllDeleted() {
    this.dispatch('allDeleted');
  }

  private fireDataImported() {
    this.dispatch('dataImported');
  }

  private async openDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
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
  }

  public async get<T>(key: string): Promise<T> {
    if (!this.db) await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.objectStoreName]);
      const objectStore = transaction.objectStore(this.objectStoreName);
      const request = objectStore.get(key);
      request.onerror = () => {
        reject(new Error(`Failed to get object with key ${key}`));
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  public async save<T>(key: string, value: T): Promise<void> {
    if (!this.db) await this.openDB();
    return new Promise((resolve, reject) => {
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

  public async delete(key: string): Promise<void> {
    if (!this.db) await this.openDB();
    return new Promise((resolve, reject) => {
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

  public async getAll<T>(): Promise<T[]> {
    if (!this.db) await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.objectStoreName]);
      const objectStore = transaction.objectStore(this.objectStoreName);
      const request = objectStore.getAll();
      request.onerror = () => {
        reject(new Error('Failed to get all objects'));
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  public async getAllByKey<T>(): Promise<{ [key: string]: T }> {
    if (!this.db) await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.objectStoreName], 'readonly');
      const objectStore = transaction.objectStore(this.objectStoreName);
      const result: { [key: string]: T } = {};

      objectStore.openCursor().onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          result[cursor.key] = cursor.value;
          cursor.continue();
        } else {
          resolve(result);
        }
      };

      transaction.onerror = () => {
        reject(new Error('Failed to get all objects'));
      };
    });
  }

  public async deleteAll(): Promise<void> {
    if (!this.db) await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.objectStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.objectStoreName);
      const request = objectStore.clear();
      request.onerror = () => {
        reject(new Error('Failed to clear object store'));
      };
      request.onsuccess = () => {
        resolve();
        this.fireAllDeleted();
      };
    });
  }

  public async exportData(): Promise<string> {
    if (!this.db) await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.objectStoreName]);
      const objectStore = transaction.objectStore(this.objectStoreName);
      const request = objectStore.getAll();
      request.onerror = () => {
        reject(new Error(`Failed to get all objects from object store ${this.objectStoreName}`));
      };
      request.onsuccess = () => {
        const data = request.result;
        const jsonData = JSON.stringify(data);
        resolve(jsonData);
      };
    });
  }

  public async importData(jsonData: string): Promise<void> {
    if (!this.db) await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.objectStoreName], 'readwrite');
      const objectStore = transaction.objectStore(this.objectStoreName);
      const data = JSON.parse(jsonData);
      const clearRequest = objectStore.clear();
      clearRequest.onerror = () => {
        reject(new Error(`Failed to clear object store ${this.objectStoreName}`));
      };
      clearRequest.onsuccess = () => {
        data.forEach((obj: any) => {
          const putRequest = objectStore.put(obj);
          putRequest.onerror = () => {
            reject(new Error(`Failed to put object with key ${obj.key}`));
          };
          putRequest.onsuccess = () => {
            resolve();
          };
        });
        this.fireDataImported();
      };
    });
  }

}
