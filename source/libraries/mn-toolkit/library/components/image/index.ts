import { FullscreenImage, IFullscreenImageProps } from './FullscreenImage';
import { FullscreenImageService } from './FullscreenImageService';

export * from './FullscreenImage';
export * from './FullscreenImages';
export * from './FullscreenImageService';
export * from './Image';

export interface IFullscreenImageListener {
  fullscreenImagesChanged: () => void;
}

export interface IFullscreenImageShowOptions<P extends IFullscreenImageProps> {
  type: string;
  Component: new (...args: P[]) => FullscreenImage;
  componentProps: P;
}

declare global {
  interface IApp {
    $fullscreenImage: FullscreenImageService;
  }
}
