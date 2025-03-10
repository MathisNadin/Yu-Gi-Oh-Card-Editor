import { isDefined, logger, serialize, unserialize } from 'mn-tools';
import { IStoreOptions, IStoreService, TStoreValue } from '.';

const log = logger('$store');

export class LocalStorageService implements IStoreService {
  private options: IStoreOptions;

  public get storePrefix() {
    return this.options.storePrefix || `${this.options.storeName}::`;
  }

  public constructor(options: IStoreOptions) {
    this.options = options;
  }

  public async setup() {
    log.debug('Setting up LocalStorage Service');
    const storeVersion = await this.get<number>('storeVersion', this.options.storeVersion);
    if (storeVersion < this.options.storeVersion) {
      await this.clear();
    }
  }

  public async set<T extends TStoreValue = TStoreValue, K extends string = string>(key: K, value: T) {
    log.debug(`Storing item in LocalStorage: key=${key}, value=${value}`);
    localStorage.setItem(`${this.storePrefix}${key}`, serialize(value));
    return Promise.resolve();
  }

  public async get<T extends TStoreValue, K extends string = string>(key: K, defaultValue?: T) {
    log.debug(`Retrieving item from LocalStorage: key=${key}`);
    const item = localStorage.getItem(`${this.storePrefix}${key}`);
    const result = isDefined(item) && item !== null ? unserialize(item) : defaultValue;
    return Promise.resolve(result as T);
  }

  public async remove<K extends string = string>(key: K) {
    log.debug(`Removing item from LocalStorage: key=${key}`);
    localStorage.removeItem(`${this.storePrefix}${key}`);
    return Promise.resolve();
  }

  public async clear() {
    log.debug('Clearing all items from LocalStorage');
    for (const key in localStorage) {
      localStorage.removeItem(key);
    }
    await this.set('storeVersion', this.options.storeVersion);
  }

  public async importData(jsonData: string) {
    const data = unserialize<Record<string, TStoreValue>>(jsonData);
    for (const key in data) {
      await this.set(key, data[key]);
    }
  }

  public async exportData() {
    const data: Record<string, TStoreValue> = {};
    for (const key in localStorage) {
      data[key] = unserialize(localStorage.getItem(key)!);
    }
    return serialize(data);
  }
}
