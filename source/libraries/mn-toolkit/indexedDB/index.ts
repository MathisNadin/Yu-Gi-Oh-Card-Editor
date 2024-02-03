import { IndexedDBService } from "./IndexedDBService";

export * from './IndexedDBService';

declare global {
  interface IApp {
    $indexedDB: IndexedDBService;
  }
}
