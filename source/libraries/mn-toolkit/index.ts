import { ApiService } from "./api";
import { Application, IApplicationConfig } from "./application";
import { DeviceService } from "./device";
import { ErrorManagerService } from "./errorManager";
import { IconService, loadSvgs } from "./icon";
import { IndexedDBService } from "./indexedDB";
import { PopoverService } from "./popover";
import { PopupService } from "./popup";
import { HeaderService } from "./view";
import { ReactService } from "./react";
import { FilePickerService } from './filePicker';
import { extendNativeObjects } from 'libraries/mn-tools';
import { RouterService } from "./router";
import { XhrService } from './xhr';
import { DrawerService } from './drawer';
import { OverlayService } from './overlay';

export function setupAppAndToolkit(conf: IApplicationConfig, beforeBootstrap?: () => void) {
  extendNativeObjects();

  window.app = new Application() as IApp;

  window.app.conf = conf;

  app.service('$react', ReactService);
  app.service('$router', RouterService, { depends: ['$react'] });
  app.service('$errorManager', ErrorManagerService);
  app.service('$device', DeviceService);
  app.service('$indexedDB', IndexedDBService, { depends: ['$device']});
  app.service('$xhr', XhrService);
  app.service('$header', HeaderService);
  app.service('$api', ApiService);
  app.service('$drawer', DrawerService);
  app.service('$overlay', OverlayService);
  app.service('$icon', IconService);
  app.service('$popup', PopupService);
  app.service('$popover', PopoverService);
  app.service('$filePicker', FilePickerService);

  if (beforeBootstrap) beforeBootstrap();

  app.bootstrap();

  loadSvgs();
}

export * from './themeSettings';
export * from './drawer';
export * from './overlay';
export * from './pane';
export * from './router';
export * from './view';
export * from './xhr';
export * from './menu';
export * from './api';
export * from './application';
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
