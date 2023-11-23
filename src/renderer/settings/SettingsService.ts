import { IIndexedDBListener } from "libraries/mn-toolkit/indexedDB/IndexedDBService";
import { Observable } from "libraries/mn-toolkit/observable/Observable";
import { deepClone } from "libraries/mn-tools";
import { ICardsExportData } from "renderer/card/CardService";

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

export class SettingsService extends Observable<ISettingsListener> implements Partial<IIndexedDBListener> {
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
    app.$indexedDB.addListener(this);
    app.$errorManager.handlePromise(this.load(true));
  }

  public allDeleted() {
    app.$errorManager.handlePromise(this.load(false));
  }

  private correct(settings: IUserSettings) {
    settings.defaultRenderPath = settings.defaultRenderPath || '';
    settings.defaultArtworkPath = settings.defaultArtworkPath || '';
    settings.defaultImgImportPath = settings.defaultImgImportPath || '';
  }

  private async load(initial: boolean) {
    this._settings = await app.$indexedDB.get<IUserSettings, SettingsStorageKey>('user-settings');
    if (!this._settings) this._settings = {} as IUserSettings;
    this.correct(this._settings);
    await app.$indexedDB.save<SettingsStorageKey, IUserSettings>('user-settings', this._settings);
    if (initial) {
      this.fireSettingsLoaded();
    } else {
      this.fireSettingsUpdated();
    }
  }

  public async saveSettings(settings: Partial<IUserSettings>) {
    this._settings = { ...this.settings, ...settings };
    await app.$indexedDB.save<SettingsStorageKey, IUserSettings>('user-settings', this._settings);
    this.fireSettingsUpdated();
  }

  public async exportData() {
    const data: IExportData = {
      settings: this._settings,
      cards: app.$card.exportCardData,
    };
    await window.electron.ipcRenderer.writeJsonFile('card_editor_data', JSON.stringify(data));
  }

  public async importData() {
    const buffer = await window.electron.ipcRenderer.readFileUtf8([{ extensions: ['json'], name: 'JSON File' }]);
    if (!buffer) return;

    const data = JSON.parse(buffer.toString()) as IExportData;
    if (!data) return;

    if (data.settings) {
      const settings = deepClone(data.settings);
      this.correct(settings);
      this._settings = settings;
      await app.$indexedDB.save<SettingsStorageKey, IUserSettings>('user-settings', this._settings);
      this.fireSettingsUpdated();
    }

    if (data.cards) await app.$card.importCardData(data.cards);
  }

}
