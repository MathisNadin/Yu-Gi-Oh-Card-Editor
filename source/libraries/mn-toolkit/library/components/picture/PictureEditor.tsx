import { createRef } from 'react';
import { getCroppedArtworkBase64 } from 'mn-tools';
import { IFileCropEffect, IFileEffect } from 'api/main';
import { TJSXElementChildren } from '../../system';
import { IContainableProps, IContainableState, Containable, TDidUpdateSnapshot } from '../containable';
import { HorizontalStack } from '../container';
import { IActionsPopoverAction } from '../popover';
import { IImageProps, Image } from '../image';
import { Icon, IIconProps, IIconState, TIconId } from '../icon';
import { PictureCropperDialog, TPictureCropperAreaType } from './PictureCropperDialog';
import defaultPicturePlaceholder from 'assets/images/picture-placeholder.png';

export interface IPicture {
  /** The URL of the full picture */
  externalUrl?: string;
  /** Effects currently applied on the full picture */
  effects: IFileEffect[];
  /** The file currently uploaded */
  file?: File;
  /** The Data URL from the file */
  fileDataUrl?: string;
  /** The Data URL from the camera picture */
  cameraDataUrl?: string;
}

export interface IPictureEditorOptions {
  crop?: boolean;
  camera?: boolean;
  file?: boolean;
  delete?: boolean;
}

export interface IPictureEditorProps extends IContainableProps {
  display: 'circle' | 'square' | 'free';
  size: 'small' | 'normal' | 'big' | 'free';
  options: IPictureEditorOptions;
  placeholder: string;
  imgAlt: IImageProps['alt'];
  imgHint: IImageProps['hint'];
  value: IPicture;
  onChange: (value: IPicture) => void | Promise<void>;
}

interface IPictureEditorState extends IContainableState {
  displayUrl: string;
}

export class PictureEditor extends Containable<IPictureEditorProps, IPictureEditorState> {
  private iconRef = createRef<Icon<IIconProps, IIconState>>();

  public static override get defaultProps(): Omit<IPictureEditorProps, 'imgAlt' | 'imgHint' | 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      display: 'circle',
      size: 'normal',
      placeholder: defaultPicturePlaceholder,
      options: { crop: true, camera: true, file: true, delete: true },
    };
  }

  public static getPictureReferenceUrl(picture: IPicture) {
    let referenceUrl: string;
    if (picture.file && picture.fileDataUrl) {
      referenceUrl = picture.fileDataUrl;
    } else if (picture.cameraDataUrl) {
      referenceUrl = picture.cameraDataUrl;
    } else {
      referenceUrl = picture.externalUrl || '';
    }
    return referenceUrl;
  }

  public constructor(props: IPictureEditorProps) {
    super(props);
    this.state = {
      ...this.state,
      displayUrl: '',
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    app.$errorManager.handlePromise(this.setDisplayUrl());
  }

  public override componentDidUpdate(
    prevProps: Readonly<IPictureEditorProps>,
    prevState: Readonly<IPictureEditorState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps.value !== this.props.value) {
      app.$errorManager.handlePromise(this.setDisplayUrl());
    }
  }

  private async setDisplayUrl() {
    const referenceUrl = PictureEditor.getPictureReferenceUrl(this.props.value);

    if (!this.props.value.effects?.length) {
      return await this.setStateAsync({ displayUrl: referenceUrl });
    }

    const cropEffectUuid: IFileCropEffect['uuid'] = 'a9339c53-7084-4a6a-be2f-92c257bcd2be';
    const cropEffects = this.props.value.effects.filter(
      (effect): effect is IFileCropEffect => effect.uuid === cropEffectUuid
    );
    if (!cropEffects.length) {
      return await this.setStateAsync({ displayUrl: referenceUrl });
    }

    let croppedUrl!: string;
    try {
      const cropEffect = cropEffects[0]!;
      croppedUrl = await getCroppedArtworkBase64({
        src: referenceUrl,
        height: cropEffect.crop.height,
        width: cropEffect.crop.width,
        x: cropEffect.crop.left,
        y: cropEffect.crop.top,
        mimeType: cropEffect.mimeType,
      });
    } catch (error) {
      console.error('Failed to crop picture', error);
      app.$errorManager.trigger(error as Error);
    } finally {
      await this.setStateAsync({ displayUrl: croppedUrl || referenceUrl });
    }
  }

  private async onTap(e: React.MouseEvent<HTMLDivElement>) {
    if (this.props.onTap) await this.props.onTap(e);

    const options = this.props.options!;
    const cropEffectUuid: IFileCropEffect['uuid'] = 'a9339c53-7084-4a6a-be2f-92c257bcd2be';
    const cropEffects = this.props.value.effects.filter(
      (effect): effect is IFileCropEffect => effect.uuid === cropEffectUuid
    );
    const cropEffect = cropEffects[0];

    const referenceUrl = PictureEditor.getPictureReferenceUrl(this.props.value);
    const actions: IActionsPopoverAction[] = [];
    if (options.crop && referenceUrl && (this.props.display === 'circle' || this.props.display === 'square')) {
      const display = this.props.display;
      if (cropEffect) {
        actions.push({
          icon: { icon: 'toolkit-crop' },
          label: 'Modifier le recadrage',
          onTap: () => this.cropPicture(display),
        });
        actions.push({
          icon: { icon: 'toolkit-crop' },
          label: 'Supprimer le recadrage',
          onTap: () => this.removeCropping(),
        });
      } else {
        actions.push({
          icon: { icon: 'toolkit-crop' },
          label: 'Recadrer',
          onTap: () => this.cropPicture(display),
        });
      }
    }
    if (options.camera) {
      actions.push({
        icon: { icon: 'toolkit-camera' },
        label: 'Prendre une photo',
        onTap: () => this.takePicture(),
      });
    }
    if (options.file) {
      actions.push({
        icon: { icon: 'toolkit-image' },
        label: referenceUrl ? "Changer l'image" : 'Importer',
        onTap: () => this.pickFile(),
      });
    }
    if (options.delete && referenceUrl) {
      actions.push({
        icon: { icon: 'toolkit-trash' },
        label: 'Supprimer',
        onTap: () => this.props.onChange({ effects: [] }),
      });
    }

    if (!actions.length) return;

    if (actions.length === 1) {
      return await actions[0]!.onTap!(undefined!);
    }

    let eventOrElement: React.MouseEvent<HTMLDivElement> | HTMLElement;
    if (this.iconRef.current?.iconRef?.current) {
      eventOrElement = this.iconRef.current.iconRef.current;
    } else {
      eventOrElement = e;
    }
    app.$popover.actions(eventOrElement, { actions });
  }

  private async cropPicture(areaType: TPictureCropperAreaType) {
    const cropEffectUuid: IFileCropEffect['uuid'] = 'a9339c53-7084-4a6a-be2f-92c257bcd2be';
    const cropEffects = this.props.value.effects.filter(
      (effect): effect is IFileCropEffect => effect.uuid === cropEffectUuid
    );
    const cropEffect = cropEffects[0];
    const newCropEffect = await PictureCropperDialog.show({
      imageUrl: PictureEditor.getPictureReferenceUrl(this.props.value),
      cropEffect,
      areaType,
    });
    if (!newCropEffect || cropEffect?.changed?.getTime() === newCropEffect.changed!.getTime()) return;

    const newValue = { ...this.props.value };
    newValue.effects = newValue.effects.filter((effect) => effect.uuid !== cropEffectUuid);
    newValue.effects.push(newCropEffect);
    await this.props.onChange(newValue);
  }

  private async removeCropping() {
    const newValue = { ...this.props.value };
    newValue.effects = newValue.effects.filter((effect) => effect.uuid !== 'a9339c53-7084-4a6a-be2f-92c257bcd2be');
    await this.props.onChange(newValue);
  }

  private async pickFile() {
    try {
      const result = await app.$filePicker.pickFileList({
        accept: 'image/*',
        multiple: false,
      });
      if (!result?.length) return;

      const file = result[0]!;
      await this.onUploadFile(file);
    } catch (error) {
      console.error('Failed to select image', error);
      app.$errorManager.trigger(error as Error);
    }
  }

  private async onUploadFile(file: File) {
    try {
      // Start by checking the MIME type (especially for drag and drop)
      if (!file.type.startsWith('image/')) return;

      const newValue: IPicture = {
        file,
        fileDataUrl: await app.$api.fileToDataURL(file),
        effects: [],
      };

      if (
        this.props.options!.crop &&
        newValue.fileDataUrl &&
        (this.props.display === 'circle' || this.props.display === 'square')
      ) {
        const newCropEffect = await PictureCropperDialog.show({
          imageUrl: newValue.fileDataUrl,
          areaType: this.props.display,
        });
        if (!newCropEffect) return;
        newValue.effects.push(newCropEffect);
      }

      await this.props.onChange(newValue);
    } catch (error) {
      console.error('Failed to select image', error);
      app.$errorManager.trigger(error as Error);
    }
  }

  private async takePicture() {
    const cameraDataUrl = await app.$cameraPicker.show();
    if (!cameraDataUrl) return;

    const newValue: IPicture = {
      cameraDataUrl,
      effects: [],
    };
    if (
      this.props.options!.crop &&
      newValue.cameraDataUrl &&
      (this.props.display === 'circle' || this.props.display === 'square')
    ) {
      const newCropEffect = await PictureCropperDialog.show({
        imageUrl: newValue.cameraDataUrl,
        areaType: this.props.display,
      });
      if (!newCropEffect) return;
      newValue.effects.push(newCropEffect);
    }

    await this.props.onChange(newValue);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['has-click'] = true;
    classes['mn-picture-editor'] = true;
    if (this.props.display) classes[`${this.props.display}-display`] = true;
    if (this.props.size) classes[`${this.props.size}-size`] = true;
    return classes;
  }

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    attributes.onClick = (e) => this.onTap(e);
    attributes.onDragEnter = (e) => {
      e.preventDefault();
      if (this.base.current) this.base.current.classList.add('dragged-over');
      if (this.props.onDragEnter) app.$errorManager.handlePromise(this.props.onDragEnter(e));
    };
    attributes.onDragOver = (e) => {
      e.preventDefault();
      if (this.props.onDragOver) app.$errorManager.handlePromise(this.props.onDragOver(e));
    };
    attributes.onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      this.checkOnDragLeave(e);
      if (this.props.onDragLeave) app.$errorManager.handlePromise(this.props.onDragLeave(e));
    };
    attributes.onDrop = (e: React.DragEvent<HTMLDivElement>) => app.$errorManager.handlePromise(this.onDropFiles(e));
    return attributes;
  }

  private checkOnDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!this.base.current) return;
    const rect = this.base.current.getBoundingClientRect();
    const { clientX: x, clientY: y } = e;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      this.base.current?.classList.remove('dragged-over');
    }
  }

  private async onDropFiles(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (this.base.current?.classList) this.base.current.classList.remove('dragged-over');

    if (!event.dataTransfer?.files?.length) return;

    const file = event.dataTransfer.files.item(0);
    if (!file) return;

    await this.onUploadFile(file);
  }

  public override get children(): TJSXElementChildren {
    const { placeholder, imgAlt, imgHint, options } = this.props;
    const { displayUrl } = this.state;

    let icon: TIconId;
    if (options?.camera) {
      icon = 'toolkit-camera-full';
    } else {
      icon = 'toolkit-image';
    }

    return [
      <Image key='image' src={displayUrl || placeholder!} alt={imgAlt} hint={imgHint} />,
      <HorizontalStack
        key='icon-container'
        className='icon-container'
        itemAlignment='center'
        verticalItemAlignment='middle'
        floatPosition='bottom-right'
        bg='3'
      >
        <Icon key='icon' ref={this.iconRef} icon={icon} color='1' />
      </HorizontalStack>,
    ];
  }
}
