import { Observable, uuid } from 'mn-tools';
import { TJSXElementChild } from '../../system';
import { FullscreenImage, IFullscreenImageProps } from './FullscreenImage';
import { IFullscreenImageListener, IFullscreenImageShowOptions } from '.';

interface IFullscreenImageData {
  id: string;
  element: TJSXElementChild;
  ref: FullscreenImage | null;
}

export class FullscreenImageService extends Observable<IFullscreenImageListener> {
  public fullscreenImages: IFullscreenImageData[];

  public constructor() {
    super();
    this.fullscreenImages = [];
    app.$device.addListener({
      deviceBackButton: () => app.$fullscreenImage.removeLast(),
    });
  }

  public image(options: IFullscreenImageProps) {
    return this.show({
      type: 'fullscreen-image',
      Component: FullscreenImage,
      componentProps: options,
    });
  }

  public show<P extends IFullscreenImageProps>(options: IFullscreenImageShowOptions<P>) {
    const { Component, componentProps, type } = options;
    const id = `${type}-${this.fullscreenImages.length + 1}-${uuid()}`;
    const fullscreenImage: IFullscreenImageData = { id, element: null, ref: null };
    fullscreenImage.element = (
      <Component
        {...componentProps}
        ref={(instance) => {
          if (!instance) return;
          if (componentProps.onRef) componentProps.onRef(instance);
          fullscreenImage.ref = instance;
        }}
        key={id}
        id={id}
        type={type}
      />
    );
    this.fullscreenImages.push(fullscreenImage);
    this.dispatch('fullscreenImagesChanged');
    return id;
  }

  public remove(id: string) {
    this.fullscreenImages = this.fullscreenImages.filter((p) => p.id !== id);
    this.dispatch('fullscreenImagesChanged');
  }

  public removeLast() {
    this.fullscreenImages.pop();
    this.dispatch('fullscreenImagesChanged');
  }

  public removeAll() {
    this.fullscreenImages = [];
    this.dispatch('fullscreenImagesChanged');
  }

  public close(id: string) {
    if (!this.fullscreenImages.length) return;
    const fullscreenImage = this.fullscreenImages.find((p) => p.id === id);
    if (!fullscreenImage) return;

    if (fullscreenImage?.ref && typeof fullscreenImage.ref.close === 'function') {
      fullscreenImage.ref.close();
    } else {
      this.remove(id);
    }
  }

  public closeLast() {
    if (!this.fullscreenImages.length) return;
    const lastFullscreenImage = this.fullscreenImages[this.fullscreenImages.length - 1];
    if (lastFullscreenImage?.ref && typeof lastFullscreenImage.ref.close === 'function') {
      lastFullscreenImage.ref.close();
    } else {
      this.removeLast();
    }
  }
}
