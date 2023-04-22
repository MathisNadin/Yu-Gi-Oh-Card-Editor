/* eslint-disable prettier/prettier */
/* eslint-disable lines-between-class-members */
/* eslint-disable import/prefer-default-export */

export class IndexedDBService {
  private dbName: string;
  private dbVersion: number;
  private objectStoreName: string;
  private db: IDBDatabase | null = null;

  public constructor(dbName: string, dbVersion: number, objectStoreName: string) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.objectStoreName = objectStoreName;
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
    await this.openDB();
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
    await this.openDB();
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
}
