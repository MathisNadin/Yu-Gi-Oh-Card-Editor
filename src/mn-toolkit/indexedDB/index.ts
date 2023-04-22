/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */

import { IndexedDBService } from "./IndexedDBService";

declare global {
  interface IApp {
    $indexedDB: IndexedDBService;
  }
}
