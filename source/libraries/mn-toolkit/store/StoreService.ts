import { Observable, logger } from 'mn-tools';
import { IStoreListener, IStoreOptions, IStoreService, TStoreValue } from '.';
import { CapacitorSQLiteService } from './CapacitorSQLiteService';
import { LocalStorageService } from './LocalStorageService';
import { IndexedDBService } from './IndexedDBService';

const log = logger('$store');

export class StoreService extends Observable<IStoreListener> implements IStoreService {
  private options!: IStoreOptions;
  private storeImpl!: IStoreService;

  private fireStore(key: string, value: TStoreValue) {
    this.dispatch('storeSet', key, value);
  }

  private fireCleared() {
    this.dispatch('cleared');
  }

  private fireDataImported() {
    this.dispatch('dataImported');
  }

  public configure(options: IStoreOptions) {
    this.options = options;
    this.options.nonMobileStore = this.options.nonMobileStore || 'localStorage';
  }

  // StoreService depends on $core, which should call app.$store.configure() during its setup
  public async setup() {
    if (!this.options) {
      throw new Error('Configure the store options before setting up the database.');
    }

    if (app.$device.isCapacitor) {
      this.storeImpl = new CapacitorSQLiteService(this.options);
    } else if (this.options.nonMobileStore === 'indexedDB') {
      this.storeImpl = new IndexedDBService(this.options);
    } else {
      this.storeImpl = new LocalStorageService(this.options);
    }

    await this.storeImpl.setup();
  }

  public async set(key: string, value: TStoreValue) {
    log.debug(`Storing key "${key}"`, value);
    this.fireStore(key, value);
    await this.storeImpl.set(key, value);
  }

  public async get<T extends TStoreValue>(key: string, defaultValue?: T) {
    return await this.storeImpl.get<T>(key, defaultValue);
  }

  public async remove(key: string) {
    await this.storeImpl.remove(key);
  }

  public async clear() {
    log.debug('Clearing store space');
    await this.storeImpl.clear();
    this.fireCleared();
  }

  public async importData(jsonData: string) {
    log.debug('Importing data', jsonData);
    await this.storeImpl.importData(jsonData);
    this.fireDataImported();
  }

  public async exportData() {
    log.debug('Exporting all data');
    return await this.storeImpl.exportData();
  }
}
