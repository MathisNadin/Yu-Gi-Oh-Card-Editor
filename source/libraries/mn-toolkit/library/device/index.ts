import { DeviceService } from './DeviceService';

export * from './DeviceService';

declare global {
  interface IApp {
    $device: DeviceService;
  }

  interface Document {
    mozHidden?: boolean;
    msHidden?: boolean;
    webkitHidden?: boolean;
  }

  interface Navigator {
    msMaxTouchPoints?: number;
  }

  interface Window {
    chrome?: boolean;
    opr?: boolean;
  }
}
