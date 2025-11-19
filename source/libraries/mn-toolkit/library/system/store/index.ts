import { StoreService } from './StoreService';

export * from './StoreService';

export type TStoreValue = string | number | boolean | Date | ArrayBuffer | Blob | object | null | undefined;

export interface IStoreListener {
  storeSet: <K extends string = string>(key: K, value: TStoreValue) => void | Promise<void>;
  cleared: () => void | Promise<void>;
  dataImported: (data: object) => void | Promise<void>;
}

export interface IStoreOptions {
  nonMobileStore?: 'localStorage' | 'indexedDB';
  storeVersion: number;
  storeName: string;
  storePrefix?: string;
}

export interface IStoreService {
  setup: () => Promise<void>;
  set<T extends TStoreValue = TStoreValue, K extends string = string>(key: K, value: T): Promise<void>;
  get<T extends TStoreValue, K extends string = string>(key: K): Promise<T | undefined>;
  get<T extends TStoreValue, K extends string = string>(key: K, defaultValue: T): Promise<T>;
  remove<K extends string = string>(key: K): Promise<void>;
  clear(): Promise<void>;
  importData(jsonData: string): Promise<object>;
  exportData(): Promise<string | undefined>;
}

declare global {
  interface IApp {
    $store: StoreService;
  }
}
