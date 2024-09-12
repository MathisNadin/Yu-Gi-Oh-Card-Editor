export interface IFilePickerOptions {
  accept?: string;
  multiple?: boolean;
  imageQuality?: number;
  imageMimeType?: string;
}

export class FilePickerService {
  // Méthode pour récupérer une FileList
  public async pickFileList(options: IFilePickerOptions = {}): Promise<FileList | undefined> {
    return await this.html5FileList(options);
  }

  // Méthode pour récupérer une chaîne de caractères (string) à partir d'un fichier
  public async pickString(options: IFilePickerOptions = {}): Promise<string | undefined> {
    const fileList = await this.html5FileList({ ...options, multiple: false });
    if (!fileList) return undefined;
    try {
      const result = await app.$api.fileToString(fileList[0]);
      return result;
    } catch (error) {
      console.error('Error converting file to string:', error);
      return undefined;
    }
  }

  // Méthode pour récupérer un buffer à partir d'un fichier
  public async pickBuffer(options: IFilePickerOptions = {}): Promise<string | undefined> {
    const fileList = await this.html5FileList({ ...options, multiple: false });
    if (!fileList) return undefined;
    try {
      const result = await app.$api.fileToDataURL(fileList[0]);
      return result;
    } catch (error) {
      console.error('Error converting file to buffer:', error);
      return undefined;
    }
  }

  // Fonction privée pour gérer la sélection de fichiers HTML5
  private async html5FileList(options: IFilePickerOptions): Promise<FileList | undefined> {
    const fileInput = document.createElement('input');
    const fileList = await new Promise<FileList | undefined>((resolve) => {
      fileInput.type = 'file';
      if (options.accept) fileInput.accept = options.accept;
      if (options.multiple) fileInput.multiple = options.multiple;
      fileInput.style.display = 'none';

      fileInput.addEventListener('change', (event) => {
        const input = event.currentTarget as HTMLInputElement;
        resolve(input.files || undefined);
      });

      document.body.appendChild(fileInput);
      fileInput.click();
    });
    if (fileInput.parentNode) fileInput.remove();
    return fileList;
  }
}
