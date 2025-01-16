import { CameraPickerService } from './CameraPickerService';

export * from './CameraPickerDialog';
export * from './CameraPickerService';

declare global {
  interface IApp {
    $cameraPicker: CameraPickerService;
  }
}
