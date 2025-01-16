import { extendNativeObjects } from 'mn-tools';
import { loadSvgs } from './svgs';
import {
  ApiService,
  Application,
  AxiosService,
  CameraPickerService,
  DateTimePickerService,
  DeviceService,
  ErrorManagerService,
  HeaderService,
  IconService,
  OverlayService,
  PermissionService,
  PopoverService,
  PopupService,
  ReactService,
  RouterService,
  SavingManagerService,
  SessionService,
  StoreService,
  ThemeService,
  ToasterService,
  XhrService,
  FilePickerService,
  TipService,
} from './library';

export * from './library';

export function setupAppAndToolkit(conf: IApplicationConfig, beforeBootstrap?: () => void) {
  extendNativeObjects();
  Date.setFirstDayOfWeek(1);

  window.app = new Application(conf) as IApp;

  app.service('$errorManager', ErrorManagerService);
  app.service('$device', DeviceService);
  app.service('$react', ReactService);
  app.service('$router', RouterService, { depends: ['$react'] });
  app.service('$theme', ThemeService);
  app.service('$toaster', ToasterService, { depends: ['$react'] });
  app.service('$store', StoreService, { depends: ['$device', '$core'] });
  app.service('$permission', PermissionService);
  app.service('$session', SessionService, { depends: ['$store', '$permission', '$api'] });
  app.service('$xhr', XhrService);
  app.service('$header', HeaderService);
  app.service('$api', ApiService);
  app.service('$axios', AxiosService);
  app.service('$overlay', OverlayService);
  app.service('$icon', IconService);
  app.service('$popup', PopupService);
  app.service('$popover', PopoverService, { depends: ['$react'] });
  app.service('$filePicker', FilePickerService);
  app.service('$savingManager', SavingManagerService);
  app.service('$tips', TipService);
  app.service('$dateTimePicker', DateTimePickerService);
  app.service('$cameraPicker', CameraPickerService);

  if (beforeBootstrap) beforeBootstrap();

  app.bootstrap();

  loadSvgs();
}
