import { IFilePickerOptions } from './index';

export class FilePickerService {
  public async show(options: IFilePickerOptions = {}) {
    options.outputType = options.outputType || 'files';
    options.imageQuality = options.imageQuality || 100;
    options.imageMimeType = options.imageMimeType || 'image/jpeg';
    options.multiple = options.multiple || options.outputType === 'files';
    /* if (app.hasCordova) {
      return await this.cordova(options);
    } else {
      return await this.html5(options);
    } */
    return await this.html5(options);
  }

  private async html5(options: IFilePickerOptions) {
    return new Promise<FileList | string | null>((resolve, reject) => {
      let fileInput = document.createElement('input');
      fileInput.setAttribute('type', 'file');
      if (options.accept) fileInput.setAttribute('accept', options.accept);
      if (options.multiple) fileInput.setAttribute('multiple', options.multiple ? 'true' : 'false');
      fileInput.style.display = 'none';
      fileInput.addEventListener('change', (event) => {
        const input = event.currentTarget as HTMLInputElement;
        fileInput.remove();
        if (options.outputType === 'files') return resolve(input.files);
        this.fileToBuffer((input.files as FileList)[0], options.outputType)
          .then((result) => {
            resolve(result);
          })
          .catch((error: Error) => reject(error));
      });
      document.body.appendChild(fileInput);
      fileInput.click();
    });
  }

  /* private async cordova(options: IFilePickerOptions) {
    return new Promise<FileList | string>((resolve, reject) => {
      navigator.camera.getPicture(
        (data: string) => resolve('data:' + options.imageMimeType + ';base64,' + data),
        (error: string) => reject(new Error(error)),
        {
          quality: options.imageQuality,
          correctOrientation: true,
          encodingType: options.imageMimeType === 'image/jpeg' ? 0 : 1,
          sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
          destinationType: Camera.DestinationType.DATA_URL
        }
      );
    });
  } */

  public async fileToBuffer(file: File | null, outputType: 'url' | 'string' | undefined) {
    return new Promise<string>((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = (event) => resolve((event.target as FileReader).result as string);
      reader.onerror = (error) => reject(error);
      if (outputType === 'url') {
        reader.readAsDataURL(file as File);
      } else {
        reader.readAsText(file as File);
      }
    });
  }
}
