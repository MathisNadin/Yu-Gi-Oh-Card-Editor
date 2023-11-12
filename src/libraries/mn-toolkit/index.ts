import { ApiService } from "./api/ApiService";
import { Application } from "./bootstrap";
import { DeviceService } from "./device";
import { ErrorManagerService } from "./error-manager";
import { IndexedDBService } from "./indexedDB/IndexedDBService";
import { PopupService } from "./popup/PopupService";
import * as theme from "./settings.json";

interface IThemeSettings {
  themeDefaultSpacing: number;
  themeDefaultItemHeight: number;
  themeDefaultBorderRadius: number;
  themeDefaultFontSize: number;
  themeMaxContentWidth: number;
  themeMaxListWidth: number;
}

export function themeSettings() : IThemeSettings {
  return theme as IThemeSettings;
}

export function setupAppAndToolkit(beforeBootstrap?: () => void) {
  window.app = new Application() as IApp;

  app.settings = {
    dbName: 'card-editor-db',
    objectStoreName: 'card-editor-object-store',
  }

  app.service('$errorManager', ErrorManagerService);
  app.service('$device', DeviceService, /* {depends: ['$store']} */);
  app.service('$indexedDB', IndexedDBService);
  app.service('$api', ApiService);
  app.service('$popup', PopupService);

  if (beforeBootstrap) beforeBootstrap();

  app.bootstrap();
}

