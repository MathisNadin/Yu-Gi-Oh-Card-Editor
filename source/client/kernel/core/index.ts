export * from './CoreService';

export interface ICoreListener {
  electronUpdateDownloaded: (info: TElectronUpdateInfo) => void;
}

import { CoreService } from './CoreService';

declare global {
  interface IApp {
    $core: CoreService;
  }
}
