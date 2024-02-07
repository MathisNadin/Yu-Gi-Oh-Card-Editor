export * from './OverlayService';

export interface IOverlayListener {
  overlayClick(): void;
}

import { OverlayService } from './OverlayService';

declare global {
  interface IApp {
    $overlay: OverlayService;
  }
}
