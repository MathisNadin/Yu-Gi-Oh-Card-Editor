import { PopupService } from './PopupService';

export * from './PopupService';
export * from './Popup';

declare global {
  interface IApp {
    $popup: PopupService;
  }
}
