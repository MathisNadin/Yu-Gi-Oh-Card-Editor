/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import { PopupService } from './PopupService';

declare global {
  interface IApp {
    $popup: PopupService;
  }
}
