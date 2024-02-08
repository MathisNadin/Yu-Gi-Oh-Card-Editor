import { SettingsService } from './SettingsService';

export * from './Settings';
export * from './SettingsService';

declare global {
  interface IApp {
    $settings: SettingsService;
  }
}
