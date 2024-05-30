import { StoreService } from './StoreService';

export * from './StoreService';

export type TStoreValue = string | number | boolean | Date | ArrayBuffer | Blob | object;

export interface IStoreListener {
  storeSet(key: string, value: TStoreValue): void;
  cleared: () => void;
  dataImported: () => void;
}

export interface IStoreOptions {
  nonMobileStore?: 'localStorage' | 'indexedDB';
  storeVersion: number;
  storeName: string;
  storePrefix?: string;
}

export interface IStoreService {
  setup: () => Promise<void>;
  set(key: string, value: TStoreValue): Promise<void>;
  get<T extends TStoreValue>(key: string, defaultValue?: T): Promise<T>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  importData(jsonData: string): Promise<void>;
  exportData(): Promise<string>;
}

declare global {
  interface IApp {
    $store: StoreService;
  }
}
