import { ApiService } from "./api/ApiService";
import { Application, IAppSettings } from "./bootstrap";
import { DeviceService } from "./device";
import { ErrorManagerService } from "./error-manager";
import { IconService, loadSvgs } from "./icon";
import { IndexedDBService } from "./indexedDB/IndexedDBService";
import { PopoverService } from "./popover/PopoverService";
import { PopupService } from "./popup/PopupService";
import { ReactService } from "./react";

export function setupAppAndToolkit(appSettings: IAppSettings, beforeBootstrap?: () => void) {
  window.app = new Application() as IApp;

  app.settings = appSettings;

  app.service('$errorManager', ErrorManagerService);
  app.service('$react', ReactService);
  app.service('$device', DeviceService, /* {depends: ['$store']} */);
  app.service('$indexedDB', IndexedDBService);
  app.service('$api', ApiService);
  app.service('$icon', IconService);
  app.service('$popup', PopupService);
  app.service('$popover', PopoverService);

  if (beforeBootstrap) beforeBootstrap();

  app.bootstrap();

  loadSvgs();
}

