import { ICardsExportData } from 'client/editor/card';
import { IStoreListener } from 'mn-toolkit';
import { Observable, deepClone, isObject } from 'mn-tools';

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

export class SettingsService extends Observable<ISettingsListener> implements Partial<IStoreListener> {
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
    if (!app.$device.isDesktop) return;
    window.electron.ipcRenderer.on('importData', async () => {
      await this.importData();
    });

    window.electron.ipcRenderer.on('exportData', async () => {
      await this.exportData();
    });
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
    this._settings = await app.$store.get<IUserSettings, SettingsStorageKey>('user-settings');
    if (!this._settings) this._settings = {} as IUserSettings;
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
      if (!result?.content) return;

      const decoder = new TextDecoder('utf-8');
      const stringContent = decoder.decode(result.content);
      if (!stringContent) return;

      const data = JSON.parse(stringContent);
      if (!data || !isObject(data)) return;

      if (data.settings) {
        const settings = deepClone((data as IExportData).settings);
        this.correct(settings);
        this._settings = settings;
        await app.$store.set<IUserSettings, SettingsStorageKey>('user-settings', this._settings);
        this.fireSettingsUpdated();
      }

      if (data.cards) await app.$card.importCardData(data.cards);
    } catch (error) {
      console.error(error);
    }
  }
}
