import { GalleryService } from './GalleryService';

export * from './GalleryService';
export * from './GalleryContainer';

declare global {
  interface IApp {
    $gallery: GalleryService;
  }
}
