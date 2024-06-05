import { IFilePickerOptions } from './index';

export class FilePickerService {
  public async show(options: IFilePickerOptions = {}) {
    options.outputType = options.outputType || 'files';
    options.imageQuality = options.imageQuality || 100;
    options.imageMimeType = options.imageMimeType || 'image/jpeg';
    options.multiple = options.multiple || options.outputType === 'files';
    return await this.html5(options);
  }

  private async html5(options: IFilePickerOptions) {
    return new Promise<FileList | string | null>((resolve, reject) => {
      const fileInput = document.createElement('input');
      fileInput.setAttribute('type', 'file');
      if (options.accept) fileInput.setAttribute('accept', options.accept);
      if (options.multiple) fileInput.setAttribute('multiple', options.multiple ? 'true' : 'false');
      fileInput.style.display = 'none';
      fileInput.addEventListener('change', (event) => {
        const input = event.currentTarget as HTMLInputElement;
        fileInput.remove();
        if (options.outputType === 'files') return resolve(input.files);
        app.$api
          .fileToBuffer((input.files as FileList)[0], options.outputType)
          .then((result) => {
            resolve(result);
          })
          .catch((error: Error) => reject(error));
      });
      document.body.appendChild(fileInput);
      fileInput.click();
    });
  }
}
