import { isDefined, isString, logger, serialize, unserialize } from 'mn-tools';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { App as CapacitorApp } from '@capacitor/app';
import { IStoreOptions, IStoreService, TStoreValue } from '.';

const log = logger('$store');

export class CapacitorSQLiteService implements IStoreService {
  private connectionPromise!: Promise<void>;
  private isConnectionReady: boolean;
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private options: IStoreOptions;
  private tableName: string;

  public constructor(options: IStoreOptions) {
    this.isConnectionReady = false;
    this.options = options;
    this.tableName = 'CapacitorKeyValueStore';
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  // For handling cases where connection is being reopened
  private async waitForConnection() {
    if (this.isConnectionReady) {
      return; // La connexion est déjà prête, retourne immédiatement
    }
    if (isDefined(this.connectionPromise)) {
      await this.connectionPromise; // Attendre que la connexion actuelle soit prête
    } else {
      throw new Error('No connection is being established.');
    }
  }

  public async setup() {
    log.debug('Setting up Capacitor SQLite Service', this.options);

    // Cleanup just in case
    await CapacitorApp.removeAllListeners();
    await this.sqlite.checkConnectionsConsistency();
    await this.sqlite.closeAllConnections();

    await CapacitorApp.addListener('appStateChange', (state) => {
      log.debug('Capacitor app state changed', state);
      if (state.isActive) {
        log.debug('Application is active, reopening SQLite connection.');
        app.$errorManager.handlePromise(this.openConnection());
      } else {
        log.debug('Application is not active, closing SQLite connection.');
        app.$errorManager.handlePromise(this.closeConnection());
      }
    });

    await CapacitorApp.addListener('backButton', () => {
      log.debug('Back button pressed, closing SQLite connection.');
      app.$errorManager.handlePromise(this.closeConnection());
    });

    await this.openConnection();

    const storeVersion = await this.get<number>('storeVersion', this.options.storeVersion);
    if (isDefined(storeVersion) && storeVersion < this.options.storeVersion) {
      await this.clear();
    }
  }

  private async openConnection() {
    if (this.isConnectionReady) return; // Already opened

    this.connectionPromise = new Promise<void>((resolve, reject) => {
      this.checkConnection()
        .then(() => resolve())
        .catch((error) => {
          log.error('Error while opening Connection', error);
          reject(error);
        });
    });

    return await this.connectionPromise;
  }

  private async checkConnection() {
    const exists = await this.sqlite.isConnection(this.options.storeName, false);
    log.debug('storeName isConnection result', exists);
    if (exists.result) {
      log.debug('Connection already exists');
      this.db = await this.sqlite.retrieveConnection(this.options.storeName, false);
    } else {
      log.debug('Connection does not exists yet');
      this.db = await this.sqlite.createConnection(this.options.storeName, false, 'no-encryption', 1, false);
      await this.db.open();
    }

    // Ensure the table exists
    await this.db.execute(`CREATE TABLE IF NOT EXISTS ${this.tableName} (key TEXT PRIMARY KEY, value TEXT);`);

    this.isConnectionReady = true;
  }

  private async closeConnection() {
    if (!this.isConnectionReady) {
      return; // La connexion n'est pas ouverte ou déjà en cours de fermeture
    }
    try {
      await this.sqlite.closeConnection(this.options.storeName, false);
      this.isConnectionReady = false;
      this.connectionPromise = undefined!;
      log.debug('SQLite connection closed');
    } catch (error) {
      log.error('Failed to close SQLite connection', error);
      app.$errorManager.trigger(error as Error);
    }
  }

  private serializeDBValue(value: TStoreValue) {
    if (isString(value)) {
      return value;
    } else {
      return serialize(value);
    }
  }

  private unserializeDBValue(value: string) {
    // Wasn't serialized, so it's just a string
    if (!value.startsWith('{')) {
      return value;
    } else {
      return unserialize<Record<string, TStoreValue>>(value);
    }
  }

  public async set<T extends TStoreValue = TStoreValue, K extends string = string>(key: K, value: T) {
    await this.waitForConnection();
    const serializedValue = this.serializeDBValue(value);
    log.debug('Setting item in SQLite:', {
      key,
      value,
      type: typeof value,
      serialized: serializedValue,
      unserialized: this.unserializeDBValue(serializedValue),
    });
    await this.db.execute(
      `INSERT OR REPLACE INTO ${this.tableName} (key, value) VALUES ('${key}', '${serializedValue}');`,
      true
    );
  }

  public async get<T extends TStoreValue, K extends string = string>(key: K, defaultValue?: T) {
    await this.waitForConnection();
    log.debug('Getting item from SQLite:', { key, defaultValue });
    const { values } = await this.db.query(`SELECT value FROM ${this.tableName} WHERE key = '${key}';`);
    if (values?.length && isDefined(values[0]?.value)) return this.unserializeDBValue(values[0].value) as T;
    return defaultValue;
  }

  public async remove<K extends string = string>(key: K) {
    await this.waitForConnection();
    log.debug(`Removing item from SQLite: key=${key}`);
    await this.db.execute(`DELETE FROM ${this.tableName} WHERE key = '${key}';`, true);
  }

  public async clear() {
    await this.waitForConnection();
    log.debug('Clearing all items from SQLite');
    await this.db.execute(`DELETE FROM ${this.tableName};`);
    await this.set('storeVersion', this.options.storeVersion);
  }

  public async importData(jsonData: string) {
    await this.waitForConnection();
    const data = unserialize<Record<string, TStoreValue>>(jsonData);
    for (const key in data) {
      await this.set(key, data[key]);
    }
  }

  public async exportData() {
    await this.waitForConnection();
    const { values } = await this.db.query(`SELECT key, value FROM ${this.tableName};`);
    if (!values) return '';

    const data: { [key: string]: TStoreValue } = {};
    for (const { key, value } of values) {
      data[key] = this.unserializeDBValue(value);
    }
    return serialize(data);
  }
}
