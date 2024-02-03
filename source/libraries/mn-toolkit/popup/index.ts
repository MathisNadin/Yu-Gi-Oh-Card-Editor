import { PopupService } from './PopupService';

declare global {
  interface IApp {
    $popup: PopupService;
  }
}
