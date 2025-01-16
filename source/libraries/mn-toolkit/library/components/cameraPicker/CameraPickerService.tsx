import {
  Camera as CapacitorCamera,
  CameraResultType as CapacitorCameraResultType,
  CameraSource as CapacitorCameraSource,
} from '@capacitor/camera';
import { CameraPickerDialog, ICameraPickerDialogProps } from '.';

export class CameraPickerService {
  private async capacitor(quality?: number) {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality,
        allowEditing: false,
        resultType: CapacitorCameraResultType.DataUrl,
        source: CapacitorCameraSource.Camera,
      });
      return image.dataUrl;
    } catch (error) {
      throw new Error(`Error retrieving camera image: ${(error as Error).message}`);
    }
  }

  public async show(options: ICameraPickerDialogProps = {}) {
    options.quality = options.quality || 100;
    options.mimeType = options.mimeType || 'image/jpeg';

    if (app.$device.isCapacitor) {
      return await this.capacitor(options.quality);
    } else {
      return await CameraPickerDialog.show(options);
    }
  }
}
