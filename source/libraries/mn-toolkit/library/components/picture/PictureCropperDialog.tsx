import { createRef } from 'react';
import { classNames } from 'mn-tools';
import { IFileCropEffect } from 'api/main';
import { AbstractPopup, IAbstractPopupProps, IAbstractPopupState } from '../popup';
import { Slider } from '../slider';

export type TPictureCropperAreaType = 'circle' | 'square';

interface IPictureCropperDialogProps extends IAbstractPopupProps<IFileCropEffect> {
  imageUrl: string;
  cropEffect?: IFileCropEffect;
  areaType?: TPictureCropperAreaType;
}

interface IPictureCropperDialogState extends IAbstractPopupState {
  scale: number;
  position: { x: number; y: number };
  containerDimensions: { width: number; height: number };
  imageDimensions: { width: number; height: number };
  cropAreaDimensions: { width: number; height: number };
}

export class PictureCropperDialog extends AbstractPopup<
  IFileCropEffect,
  IPictureCropperDialogProps,
  IPictureCropperDialogState
> {
  private originalImageDimensions: { width: number; height: number } = { width: 0, height: 0 };
  private lastClientX: number = 0;
  private lastClientY: number = 0;
  private isDragging: boolean = false;
  private containerRef = createRef<HTMLDivElement>();

  public static async show(options: IPictureCropperDialogProps) {
    options.title = "Recadrer l'image";
    options.areaType = options.areaType || 'circle';
    options.height = options.height || '90%';
    options.width = options.width || (app.$device.isSmallScreen ? '90%' : '80%');
    return await app.$popup.show({
      type: 'picture-cropper',
      Component: PictureCropperDialog,
      componentProps: options,
    });
  }

  protected override async onInitializePopup() {
    const buttons = this.state.buttons;
    buttons.push({
      name: 'Valider',
      label: 'Valider',
      color: 'primary',
      onTap: () => this.onValidate(),
    });

    if (this.props.cropEffect?.original) {
      this.originalImageDimensions.width = this.props.cropEffect.original.width;
      this.originalImageDimensions.height = this.props.cropEffect.original.height;
    } else {
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.src = this.props.imageUrl;
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(err);
        });
        this.originalImageDimensions.width = img.width;
        this.originalImageDimensions.height = img.height;
      } catch (error) {
        console.error('Error loading image:', error);
        app.$errorManager.trigger(error as Error);
      }
    }

    await this.setStateAsync({ buttons });
  }

  protected override async checkSize() {
    await super.checkSize();
    await this.calculateDimensions();
  }

  private async calculateDimensions() {
    if (!this.containerRef.current) throw new Error('Container ref current not defined');

    const { cropEffect } = this.props;
    const containerDimensions = {
      width: this.containerRef.current.clientWidth || 0,
      height: this.containerRef.current.clientHeight || 0,
    };

    const imageAspectRatio = this.originalImageDimensions.width / this.originalImageDimensions.height;
    const cropAreaSize = Math.min(containerDimensions.width, containerDimensions.height);

    let scaledWidth: number;
    let scaledHeight: number;
    if (this.originalImageDimensions.width > this.originalImageDimensions.height) {
      scaledHeight = cropAreaSize;
      scaledWidth = scaledHeight * imageAspectRatio;
    } else {
      scaledWidth = cropAreaSize;
      scaledHeight = scaledWidth / imageAspectRatio;
    }

    let initialScale = 1;
    let initialPosition = { x: 0, y: 0 };

    if (cropEffect) {
      const cropWidthAtScale1 = (cropEffect.crop.width / 100) * scaledWidth;
      const cropHeightAtScale1 = (cropEffect.crop.height / 100) * scaledHeight;

      initialScale = Math.max(1, Math.min(3, cropAreaSize / Math.max(cropWidthAtScale1, cropHeightAtScale1)));

      initialPosition = {
        x: -(cropEffect.crop.left / 100) * (scaledWidth * initialScale),
        y: -(cropEffect.crop.top / 100) * (scaledHeight * initialScale),
      };
    }

    await this.setStateAsync({
      imageDimensions: { width: scaledWidth, height: scaledHeight },
      containerDimensions,
      cropAreaDimensions: { width: cropAreaSize, height: cropAreaSize },
      position: initialPosition,
      scale: initialScale,
    });
  }

  private isReactTouchEvent(event: React.MouseEvent<HTMLDivElement> | React.TouchEvent): event is React.TouchEvent {
    return event.type.startsWith('touch');
  }

  private startDrag(event: React.MouseEvent<HTMLDivElement> | React.TouchEvent) {
    const isTouch = this.isReactTouchEvent(event);
    this.lastClientX = isTouch ? event.touches[0]!.clientX : event.clientX;
    this.lastClientY = isTouch ? event.touches[0]!.clientY : event.clientY;
    this.isDragging = true;

    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', this.handleDrag);
    document.addEventListener(isTouch ? 'touchend' : 'mouseup', this.endDrag);
  }

  private isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
    return event.type.startsWith('touch');
  }

  private handleDrag = (event: MouseEvent | TouchEvent) => {
    if (!this.isDragging) return;

    const { scale, imageDimensions, cropAreaDimensions, position } = this.state;

    const isTouch = this.isTouchEvent(event);
    const clientX = isTouch ? event.touches[0]!.clientX : event.clientX;
    const clientY = isTouch ? event.touches[0]!.clientY : event.clientY;

    const deltaX = clientX - this.lastClientX;
    const deltaY = clientY - this.lastClientY;

    const scaledWidth = imageDimensions.width * scale;
    const scaledHeight = imageDimensions.height * scale;

    // Calculer les limites de déplacement
    const minX = cropAreaDimensions.width - scaledWidth;
    const minY = cropAreaDimensions.height - scaledHeight;
    const maxX = 0;
    const maxY = 0;

    const newPosition = {
      x: Math.max(Math.min(position.x + deltaX, maxX), minX),
      y: Math.max(Math.min(position.y + deltaY, maxY), minY),
    };

    this.lastClientX = clientX;
    this.lastClientY = clientY;

    this.setState({ position: newPosition });
  };

  private endDrag = () => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.endDrag);
    document.removeEventListener('touchmove', this.handleDrag);
    document.removeEventListener('touchend', this.endDrag);
  };

  private async onValidate() {
    const { position, scale, imageDimensions } = this.state;

    // Retirer le concept de scale, ramener les dimensions à une échelle de 1
    const scaledWidth = imageDimensions.width * scale;
    const scaledHeight = imageDimensions.height * scale;

    const left = Math.round((Math.abs(position.x) / scaledWidth) * 10000) / 100;
    const top = Math.round((Math.abs(position.y) / scaledHeight) * 10000) / 100;

    const cropWidth = Math.round((this.state.cropAreaDimensions.width / scaledWidth) * 10000) / 100;
    const cropHeight = Math.round((this.state.cropAreaDimensions.height / scaledHeight) * 10000) / 100;

    const cropEffect: IFileCropEffect = {
      uuid: 'a9339c53-7084-4a6a-be2f-92c257bcd2be',
      mimeType: 'image/webp',
      crop: {
        height: cropHeight,
        width: cropWidth,
        left,
        top,
      },
      original: this.originalImageDimensions,
      changed: new Date(),
    };

    await this.close(cropEffect);
  }

  private async onChangeScale(scale: number) {
    const { position, imageDimensions, cropAreaDimensions } = this.state;

    const scaledWidth = imageDimensions.width * scale;
    const scaledHeight = imageDimensions.height * scale;

    // Calculer les nouvelles limites de déplacement
    const minX = cropAreaDimensions.width - scaledWidth;
    const minY = cropAreaDimensions.height - scaledHeight;
    const maxX = 0;
    const maxY = 0;

    // Vérifier si la nouvelle position dépasse les limites
    let newPosition = { ...position };

    if (position.x < minX) {
      newPosition.x = minX;
    } else if (position.x > maxX) {
      newPosition.x = maxX;
    }

    if (position.y < minY) {
      newPosition.y = minY;
    } else if (position.y > maxY) {
      newPosition.y = maxY;
    }

    await this.setStateAsync({ scale, position: newPosition });
  }

  protected override get scrollInContent() {
    return false;
  }

  public override renderContent() {
    const { imageUrl, areaType } = this.props;
    const { position, scale, containerDimensions, cropAreaDimensions, imageDimensions } = this.state;

    let containerIsHigher = false;
    if (containerDimensions) {
      containerIsHigher = containerDimensions.height > containerDimensions.width;
    }

    return [
      <div
        key='picture'
        className='image-container'
        ref={this.containerRef}
        onMouseDown={(e) => this.startDrag(e)}
        onTouchStart={(e) => this.startDrag(e)}
      >
        {!!containerDimensions && (
          <div
            className='area'
            style={{
              width: containerIsHigher ? `${containerDimensions.width}px` : `${containerDimensions.height}px`,
              height: containerIsHigher ? `${containerDimensions.width}px` : `${containerDimensions.height}px`,
            }}
          >
            {/* Image en arrière-plan avec opacité réduite */}
            <img
              src={imageUrl}
              alt='Croppable Background'
              className='background-image'
              style={{
                width: `${imageDimensions.width * scale}px`,
                height: `${imageDimensions.height * scale}px`,
                transform: `translate(${position.x}px, ${position.y}px)`,
              }}
            />
            {/* Zone de crop avec image en opacité normale */}
            <div
              className={classNames('crop-area', areaType)}
              style={{
                width: `${cropAreaDimensions.width}px`,
                height: `${cropAreaDimensions.height}px`,
              }}
            >
              <img
                src={imageUrl}
                alt='Croppable'
                style={{
                  width: `${imageDimensions.width * scale}px`,
                  height: `${imageDimensions.height * scale}px`,
                  transform: `translate(${position.x}px, ${position.y}px)`,
                }}
              />
            </div>
          </div>
        )}
      </div>,
      <Slider
        key='scale'
        min={1}
        max={3}
        step={0.1}
        valueDisplayMode='auto'
        defaultValue={scale}
        onChange={(scale) => this.onChangeScale(scale)}
      />,
    ];
  }
}
