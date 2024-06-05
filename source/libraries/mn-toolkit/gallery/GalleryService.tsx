import { GalleryContainer } from './GalleryContainer';

interface ITracked {
  url: string;
}

export interface IGaleryOptions {
  images: ITracked[];
  selectedIndex?: number;
}

export class GalleryService {
  private galeryContainer!: GalleryContainer;

  private needContainer() {
    if (!document.querySelector('.mn-gallery-container')) {
      const element = app.$react.renderContentInParent(<GalleryContainer />, document.body)!;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.galeryContainer = (element as any)._component as GalleryContainer;
    }
  }
  public show(options: IGaleryOptions) {
    this.needContainer();
    this.galeryContainer.setImages(options.images.map((x) => x.url));
  }
}
