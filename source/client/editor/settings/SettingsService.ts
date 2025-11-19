import { AbstractObservable, deepClone, isArray, isObject, isString, unserialize } from 'mn-tools';
import { IStoreListener } from 'mn-toolkit';
import { ICardsExportData } from 'client/editor/card';

interface IExportData {
  settings: IUserSettings;
  cards: ICardsExportData;
}

type SettingsStorageKey = 'user-settings';

export interface IUserSettings {
  defaultRenderPath: string;
  defaultArtworkPath: string;
  defaultImgImportPath: string;
}

export interface ISettingsListener {
  settingsLoaded: (settings: IUserSettings) => void;
  settingsUpdated: (settings: IUserSettings) => void;
}

export class SettingsService extends AbstractObservable<ISettingsListener> implements Partial<IStoreListener> {
  private _settings: IUserSettings = {} as IUserSettings;

  public get settings() {
    return this._settings;
  }

  private fireSettingsLoaded() {
    this.dispatch('settingsLoaded', this.settings);
  }

  private fireSettingsUpdated() {
    this.dispatch('settingsUpdated', this.settings);
  }

  public constructor() {
    super();
    app.$store.addListener(this);
    app.$errorManager.handlePromise(this.load(true));
  }

  public async setup() {
    if (app.$device.isElectron(window)) {
      window.electron.ipcRenderer.addListener('importData', () => app.$errorManager.handlePromise(this.importData()));
      window.electron.ipcRenderer.addListener('exportData', () => app.$errorManager.handlePromise(this.exportData()));
    }
    return Promise.resolve();
  }

  public cleared() {
    app.$errorManager.handlePromise(this.load(false));
  }

  private correct(settings: IUserSettings) {
    settings.defaultRenderPath = settings.defaultRenderPath || '';
    settings.defaultArtworkPath = settings.defaultArtworkPath || '';
    settings.defaultImgImportPath = settings.defaultImgImportPath || '';
  }

  private async load(initial: boolean) {
    this._settings = await app.$store.get<IUserSettings, SettingsStorageKey>('user-settings', {} as IUserSettings);
    this.correct(this._settings);
    await app.$store.set<IUserSettings, SettingsStorageKey>('user-settings', this._settings);
    if (initial) {
      this.fireSettingsLoaded();
    } else {
      this.fireSettingsUpdated();
    }
  }

  public async saveSettings(settings: Partial<IUserSettings>) {
    this._settings = { ...this.settings, ...settings };
    await app.$store.set<IUserSettings, SettingsStorageKey>('user-settings', this._settings);
    this.fireSettingsUpdated();
  }

  public async exportData() {
    const data: IExportData = {
      settings: this._settings,
      cards: app.$card.exportCardData,
    };
    await app.$device.writeAndDownloadJson('card_editor_data', data);
  }

  public async importData() {
    try {
      const result = await app.$device.readFileUtf8([{ extensions: ['json'], name: 'JSON File' }]);
      const resultIsString = isString(result);
      if (!result || (!resultIsString && !result.content)) return;

      const decoder = new TextDecoder('utf-8');
      const stringContent = resultIsString ? result : decoder.decode(result.content);
      if (!stringContent) return;

      const data = unserialize(stringContent);
      if (!data || !isObject(data)) return;

      if ('settings' in data && this.isUserSettings(data.settings)) {
        const settings = deepClone(data.settings);
        this.correct(settings);
        this._settings = settings;
        await app.$store.set<IUserSettings, SettingsStorageKey>('user-settings', this._settings);
        this.fireSettingsUpdated();
      }

      if ('cards' in data && this.isCardsExportData(data.cards)) {
        await app.$card.importCardData(data.cards);
      }
    } catch (error) {
      console.error(error);
    }
  }

  private isUserSettings(settings: unknown): settings is IUserSettings {
    return (
      isObject(settings) &&
      (('defaultRenderPath' in settings && isString(settings.defaultRenderPath)) ||
        ('defaultArtworkPath' in settings && isString(settings.defaultArtworkPath)) ||
        ('defaultImgImportPath' in settings && isString(settings.defaultImgImportPath)))
    );
  }

  private isCardsExportData(cards: unknown): cards is ICardsExportData {
    return (
      isObject(cards) &&
      (('current-card' in cards && isObject(cards['current-card'])) ||
        ('temp-current-card' in cards && isObject(cards['temp-current-card'])) ||
        ('local-cards' in cards && isArray(cards['local-cards'])))
    );
  }
}
