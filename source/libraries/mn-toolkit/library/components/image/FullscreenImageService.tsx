import { AbstractObservable, uuid } from 'mn-tools';
import { TJSXElementChild } from '../../system';
import { FullscreenImage, IFullscreenImageProps } from './FullscreenImage';
import { IFullscreenImageListener, IFullscreenImageShowOptions } from '.';

interface IFullscreenImageData {
  id: string;
  element: TJSXElementChild;
  ref: FullscreenImage | null;
}

export class FullscreenImageService extends AbstractObservable<IFullscreenImageListener> {
  public fullscreenImages: IFullscreenImageData[];

  public constructor() {
    super();
    this.fullscreenImages = [];
    app.$device.addListener({
      deviceBackButton: () => app.$fullscreenImage.closeLast(),
    });
    app.$router.addListener({
      routerStateChanged: () => app.$fullscreenImage.closeAll(),
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

  public async close(id: string) {
    if (!this.fullscreenImages.length) return;
    const fullscreenImage = this.fullscreenImages.find((p) => p.id === id);
    if (!fullscreenImage) return;

    if (fullscreenImage?.ref && typeof fullscreenImage.ref.close === 'function') {
      await fullscreenImage.ref.close();
    } else {
      this.remove(id);
    }
  }

  public async closeLast() {
    if (!this.fullscreenImages.length) return;
    const lastFullscreenImage = this.fullscreenImages.at(-1);
    if (lastFullscreenImage?.ref && typeof lastFullscreenImage.ref.close === 'function') {
      await lastFullscreenImage.ref.close();
    } else {
      this.removeLast();
    }
  }

  public async closeAll() {
    while (this.fullscreenImages.length) {
      await this.closeLast();
    }
  }
}
