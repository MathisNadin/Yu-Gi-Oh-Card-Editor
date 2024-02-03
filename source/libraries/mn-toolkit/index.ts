import { ApiService } from "./api";
import { Application, IAppSettings } from "./bootstrap";
import { DeviceService } from "./device";
import { ErrorManagerService } from "./errorManager";
import { IconService, loadSvgs } from "./icon";
import { IndexedDBService } from "./indexedDB";
import { PopoverService } from "./popover";
import { PopupService } from "./popup";
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

export * from './themeSettings';
export * from './api';
export * from './bootstrap';
export * from './button';
export * from './checkbox';
export * from './containable';
export * from './container';
export * from './device';
export * from './dropdown';
export * from './errorManager';
export * from './fileInput';
export * from './icon';
export * from './image';
export * from './indexedDB';
export * from './inplaceEdit';
export * from './numberInput';
export * from './observable';
export * from './popover';
export * from './popup';
export * from './progress';
export * from './react';
export * from './select';
export * from './spacer';
export * from './spinner';
export * from './table';
export * from './tabs';
export * from './textAreaInput';
export * from './textInput';
export * from './typography';
