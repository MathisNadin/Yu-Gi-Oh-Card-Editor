export type IFilePickerOutput = 'url' | 'files' | 'string';

export interface IFilePickerOptions {
  outputType?: IFilePickerOutput;
  accept?: string;
  multiple?: boolean;
  imageQuality?: number;
  imageMimeType?: string;
}

export * from './FilePickerService';

import { FilePickerService } from "./FilePickerService";

declare global {
  interface IApp {
    $filePicker: FilePickerService;
  }
}
