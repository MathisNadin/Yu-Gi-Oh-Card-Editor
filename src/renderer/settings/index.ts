export * from './Settings';
export * from './SettingsService';

import { SettingsService } from "./SettingsService";

declare global {
  interface IApp {
    $settings: SettingsService;
  }
}
