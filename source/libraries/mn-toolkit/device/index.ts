import { DeviceService } from './DeviceService';

export * from './DeviceService';

declare global {
  interface IApp {
    $device: DeviceService;
  }

  interface Document {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mozHidden: any;
  }
}
