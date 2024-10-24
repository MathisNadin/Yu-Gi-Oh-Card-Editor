export * from './FilePickerService';

import { FilePickerService } from './FilePickerService';

declare global {
  interface IApp {
    $filePicker: FilePickerService;
  }
}
