import { IndexedDBService } from "./IndexedDBService";

declare global {
  interface IApp {
    $indexedDB: IndexedDBService;
  }
}
