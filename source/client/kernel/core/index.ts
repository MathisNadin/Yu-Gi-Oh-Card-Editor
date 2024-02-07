export * from './CoreService';

import { CoreService } from './CoreService';

declare global {
  interface IApp {
    $core: CoreService;
  }
}
