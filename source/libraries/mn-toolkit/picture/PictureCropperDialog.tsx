import React, { createRef, CSSProperties } from 'react';
import { Slider } from '../slider';
import { AbstractPopup, IAbstractPopupProps, IAbstractPopupState } from '../popup';
import { IFileCropEffect } from 'api/main';
import { classNames } from 'mn-tools';
import { VerticalStack } from 'mn-toolkit/container';

export type PictureCropperAreaType = 'circle' | 'square';

interface IPictureCropperDialogProps extends IAbstractPopupProps<IFileCropEffect> {
  imageUrl: string;
  cropEffect?: IFileCropEffect;
  areaType?: PictureCropperAreaType;
}

interface IPictureCropperDialogState extends IAbstractPopupState {
  cropEffect: IFileCropEffect;
  orientation: 'landscape' | 'portrait';
}

export class PictureCropperDialog extends AbstractPopup<
  IFileCropEffect,
  IPictureCropperDialogProps,
  IPictureCropperDialogState
> {
  private containerRef = createRef<HTMLDivElement>();
  private imageRef = createRef<HTMLImageElement>();
  private dragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;

  public static EFFECT_ID: IFileCropEffect['uuid'] = 'a9339c53-7084-4a6a-be2f-92c257bcd2be';

  public static async show(options: IPictureCropperDialogProps) {
    options.title = "Recadrer l'image";
    options.areaType = options.areaType || 'circle';
    return await app.$popup.show<IFileCropEffect, IPictureCropperDialogProps>({
      type: 'picture-cropper',
      Component: PictureCropperDialog,
      componentProps: options,
    });
  }

  protected onInitializePopup = async () => {
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('touchend', this.handleTouchEnd);
    window.addEventListener('touchmove', this.handleTouchMove);

    const buttons = this.state.buttons;
    buttons.push({
      label: 'Valider',
      color: 'primary',
      onTap: () => this.close(this.state.cropEffect),
    });

    const img = new Image();
    img.src = this.props.imageUrl;
    return await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        const cropEffect: IFileCropEffect = this.props.cropEffect || {
          uuid: PictureCropperDialog.EFFECT_ID,
          mimeType: 'image/png',
          scale: 1,
          crop: {
            left: 0,
            top: 0,
            width: img.width,
            height: img.height,
          },
          original: {
            width: img.width,
            height: img.height,
          },
          changed: new Date(),
        };

        this.setState(
          {
            buttons,
            orientation: img.width > img.height ? 'landscape' : 'portrait',
            cropEffect,
          },
          () => resolve()
        );
      };

      img.onerror = (e) => {
        const error = new Error(e as string);
        app.$errorManager.trigger(error);
        reject(error);
      };
    });
  };

  public componentWillUnmount() {
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('touchmove', this.handleTouchMove);
  }

  private handleMouseDown = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.preventDefault();
    this.dragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
  };

  private handleTouchStart = (e: React.TouchEvent<HTMLImageElement>) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      this.dragging = true;
      this.dragStartX = e.touches[0].clientX;
      this.dragStartY = e.touches[0].clientY;
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.dragging) return;
    const moveX = e.clientX - this.dragStartX;
    const moveY = e.clientY - this.dragStartY;
    this.adjustImagePosition(moveX, moveY);
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
  };

  private handleTouchMove = (e: TouchEvent) => {
    if (!this.dragging || e.touches.length === 0) return;
    const touch = e.touches[0];
    const moveX = touch.clientX - this.dragStartX;
    const moveY = touch.clientY - this.dragStartY;
    this.adjustImagePosition(moveX, moveY);
    this.dragStartX = touch.clientX;
    this.dragStartY = touch.clientY;
  };

  private handleMouseUp = () => {
    this.dragging = false;
  };

  private handleTouchEnd = () => {
    this.dragging = false;
  };

  public handleSliderChange = (newScale: number) => {
    this.setState((prevState) => ({
      cropEffect: {
        ...prevState.cropEffect,
        scale: newScale,
      },
    }));
  };

  private adjustImagePosition(moveX: number, moveY: number) {
    this.setState((prevState) => {
      let newLeft = prevState.cropEffect.crop.left * -1 + moveX;
      let newTop = prevState.cropEffect.crop.top * -1 + moveY;

      const scale = prevState.cropEffect.scale;
      const orientation = prevState.orientation;
      const originalWidth = prevState.cropEffect.original.width;
      const originalHeight = prevState.cropEffect.original.height;
      let containerWidth = 0;
      let containerHeight = 0;
      if (this.containerRef.current) {
        containerWidth = this.containerRef.current.clientWidth;
        containerHeight = this.containerRef.current.clientHeight;
      }

      // Détermination de la taille réelle de l'image dans le conteneur
      let displayedImageWidth, displayedImageHeight;
      if (orientation === 'landscape') {
        displayedImageHeight = containerHeight; // Hauteur fixée à 100% du conteneur
        displayedImageWidth = (originalWidth / originalHeight) * displayedImageHeight; // Largeur ajustée selon le ratio
      } else {
        // 'portrait'
        displayedImageWidth = containerWidth; // Largeur fixée à 100% du conteneur
        displayedImageHeight = (originalHeight / originalWidth) * displayedImageWidth; // Hauteur ajustée selon le ratio
      }

      // Ajustement selon l'échelle
      displayedImageWidth *= scale;
      displayedImageHeight *= scale;

      // Assurer que l'image reste dans les limites du conteneur
      newLeft = Math.max(newLeft, containerWidth - displayedImageWidth);
      newTop = Math.max(newTop, containerHeight - displayedImageHeight);
      newLeft = Math.min(newLeft, 0); // Éviter que l'image ne se déplace trop à droite
      newTop = Math.min(newTop, 0); // Éviter que l'image ne se déplace trop en bas

      // Mettre à jour les valeurs de crop en tenant compte de l'échelle et de la position
      const cropEffect = {
        ...prevState.cropEffect,
        crop: { ...prevState.cropEffect.crop, left: newLeft * -1, top: newTop * -1 },
      };

      console.log(cropEffect);
      return { cropEffect };
    });
  }

  public renderContent = () => {
    const { imageUrl, areaType } = this.props;
    const { cropEffect, orientation } = this.state;

    const imageStyles: CSSProperties = {
      transform: `translate(${cropEffect.crop.left * -1}px, ${cropEffect.crop.top * -1}px) scale(${cropEffect.scale})`,
      transformOrigin: 'top left',
      maxHeight: orientation === 'landscape' ? '100%' : undefined,
      maxWidth: orientation === 'portrait' ? '100%' : undefined,
    };

    return (
      <VerticalStack className='mn-picture-cropper-content' itemAlignment='center' gutter>
        <div className={classNames('mn-crop-area', areaType)}>
          <div className='image-container' ref={this.containerRef}>
            {/* Conteneur fixe pour la shadow */}
            <div className='shadow-container'>
              <img src={imageUrl} alt='Croppable shadow' className='shadow' style={imageStyles} />
            </div>

            {/* Image principale pour le crop */}
            <img
              ref={this.imageRef}
              src={imageUrl}
              className='croppable'
              alt='Croppable'
              style={imageStyles}
              onMouseDown={this.handleMouseDown}
              onTouchStart={this.handleTouchStart}
            />
          </div>
        </div>

        <Slider min={1} max={3} step={0.1} defaultValue={cropEffect.scale} onChange={this.handleSliderChange} />
      </VerticalStack>
    );
  };
}
