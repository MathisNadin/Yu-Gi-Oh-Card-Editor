import { DeviceService } from './DeviceService';

export * from './DeviceService';

declare global {
  interface IApp {
    $device: DeviceService;
  }

  interface Document {
    mozHidden: any;
  }

}
