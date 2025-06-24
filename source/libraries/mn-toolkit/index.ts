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
  DrawerService,
  FullscreenImageService,
  CookieService,
} from './library';

export * from './library';

export async function setupAppAndToolkit(conf: IApplicationConfig, beforeBootstrap?: () => void | Promise<void>) {
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
  app.service('$cookie', CookieService, { depends: ['$store'] });
  app.service('$session', SessionService, { depends: ['$store', '$cookie', '$permission', '$api'] });
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
  app.service('$drawer', DrawerService);
  app.service('$fullscreenImage', FullscreenImageService);

  loadSvgs();

  if (beforeBootstrap) await beforeBootstrap();

  await app.bootstrap();
}
