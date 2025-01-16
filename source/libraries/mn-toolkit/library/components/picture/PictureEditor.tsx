import { createRef } from 'react';
import { getCroppedArtworkBase64 } from 'mn-tools';
import { IFileCropEffect, IFileEffect } from 'api/main';
import { TJSXElementChildren } from '../../system';
import { IContainableProps, IContainableState, Containable, TDidUpdateSnapshot } from '../containable';
import { HorizontalStack } from '../container';
import { IActionsPopoverAction } from '../popover';
import { Image as ToolkitImage } from '../image';
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
  display?: 'circle' | 'square' | 'free';
  size?: 'small' | 'normal' | 'big' | 'free';
  options?: IPictureEditorOptions;
  placeholder?: string;
  imgAlt?: string;
  imgTitle?: string;
  defaultValue?: IPicture;
  onChange?: (value: IPicture) => void | Promise<void>;
}

interface IPictureEditorState extends IContainableState {
  picture: IPicture;
  displayUrl: string;
}

export class PictureEditor extends Containable<IPictureEditorProps, IPictureEditorState> {
  private iconRef = createRef<Icon<IIconProps, IIconState>>();

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

  public static override get defaultProps(): IPictureEditorProps {
    return {
      ...super.defaultProps,
      display: 'circle',
      size: 'normal',
      placeholder: defaultPicturePlaceholder,
      imgAlt: 'Image',
      options: { crop: true, camera: true, file: true, delete: true },
      defaultValue: { effects: [] },
    };
  }

  public constructor(props: IPictureEditorProps) {
    super(props);
    this.state = {
      ...this.state,
      picture: this.props.defaultValue!,
      displayUrl: '',
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    app.$errorManager.handlePromise(this.setPicture(this.state.picture));
  }

  public override componentDidUpdate(
    prevProps: Readonly<IPictureEditorProps>,
    prevState: Readonly<IPictureEditorState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (this.props === prevProps) return;
    if (this.props.defaultValue === prevProps.defaultValue) return;
    app.$errorManager.handlePromise(this.setPicture(this.props.defaultValue!));
  }

  private async setPicture(picture: IPicture) {
    const referenceUrl = PictureEditor.getPictureReferenceUrl(picture);

    if (!picture.effects?.length) {
      return await this.setStateAsync({ picture, displayUrl: referenceUrl });
    }

    const cropEffectUuid: IFileCropEffect['uuid'] = 'a9339c53-7084-4a6a-be2f-92c257bcd2be';
    const cropEffects = picture.effects.filter((effect): effect is IFileCropEffect => effect.uuid === cropEffectUuid);
    if (!cropEffects.length) {
      return await this.setStateAsync({ picture, displayUrl: referenceUrl });
    }

    let croppedUrl!: string;
    try {
      const cropEffect = cropEffects[0];
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
      await this.setStateAsync({ picture, displayUrl: croppedUrl || referenceUrl });
    }
  }

  private async onTap(e: React.MouseEvent<HTMLDivElement>) {
    if (this.props.onTap) await this.props.onTap(e);

    const options = this.props.options!;
    const cropEffectUuid: IFileCropEffect['uuid'] = 'a9339c53-7084-4a6a-be2f-92c257bcd2be';
    const cropEffects = this.state.picture.effects.filter(
      (effect): effect is IFileCropEffect => effect.uuid === cropEffectUuid
    );
    const cropEffect = cropEffects[0];

    const referenceUrl = PictureEditor.getPictureReferenceUrl(this.state.picture);
    const actions: IActionsPopoverAction[] = [];
    if (options.crop && referenceUrl && (this.props.display === 'circle' || this.props.display === 'square')) {
      const display = this.props.display;
      if (cropEffect) {
        actions.push({
          icon: 'toolkit-crop',
          label: 'Modifier le recadrage',
          onTap: () => this.cropPicture(display),
        });
        actions.push({
          icon: 'toolkit-crop',
          label: 'Supprimer le recadrage',
          onTap: () => this.removeCropping(),
        });
      } else {
        actions.push({
          icon: 'toolkit-crop',
          label: 'Recadrer',
          onTap: () => this.cropPicture(display),
        });
      }
    }
    if (options.camera) {
      actions.push({
        icon: 'toolkit-camera',
        label: 'Prendre une photo',
        onTap: () => this.takePicture(),
      });
    }
    if (options.file) {
      actions.push({
        icon: 'toolkit-image',
        label: referenceUrl ? "Changer l'image" : 'Importer',
        onTap: () => this.pickFile(),
      });
    }
    if (options.delete && referenceUrl) {
      actions.push({
        icon: 'toolkit-trash',
        label: 'Supprimer',
        onTap: () => this.resetPicture(),
      });
    }

    if (!actions.length) return;

    if (actions.length === 1) {
      return await actions[0].onTap!(undefined!);
    }

    let eventOrRect: React.MouseEvent<HTMLDivElement> | DOMRect;
    if (this.iconRef.current?.iconRef?.current) {
      eventOrRect = this.iconRef.current.iconRef.current.getBoundingClientRect();
    } else {
      eventOrRect = e;
    }
    app.$popover.actions(eventOrRect, { actions });
  }

  private async cropPicture(areaType: TPictureCropperAreaType) {
    const cropEffectUuid: IFileCropEffect['uuid'] = 'a9339c53-7084-4a6a-be2f-92c257bcd2be';
    const cropEffects = this.state.picture.effects.filter(
      (effect): effect is IFileCropEffect => effect.uuid === cropEffectUuid
    );
    const cropEffect = cropEffects[0];
    const newCropEffect = await PictureCropperDialog.show({
      imageUrl: PictureEditor.getPictureReferenceUrl(this.state.picture),
      cropEffect,
      areaType,
    });
    if (!newCropEffect || cropEffect?.changed?.getTime() === newCropEffect.changed!.getTime()) return;

    const picture = { ...this.state.picture };
    picture.effects = picture.effects.filter((effect) => effect.uuid !== cropEffectUuid);
    picture.effects.push(newCropEffect);

    await this.setPicture(picture);
    if (this.props.onChange) await this.props.onChange(picture);
  }

  private async removeCropping() {
    const picture = { ...this.state.picture };
    picture.effects = picture.effects.filter((effect) => effect.uuid !== 'a9339c53-7084-4a6a-be2f-92c257bcd2be');
    await this.setPicture(picture);
    if (this.props.onChange) await this.props.onChange(picture);
  }

  private async pickFile() {
    try {
      const result = await app.$filePicker.pickFileList({
        accept: 'image/*',
        multiple: false,
      });
      if (!result?.length) return;

      const file = result[0];
      const picture: IPicture = {
        file,
        fileDataUrl: await app.$api.fileToDataURL(file),
        effects: [],
      };

      if (
        this.props.options!.crop &&
        picture.fileDataUrl &&
        (this.props.display === 'circle' || this.props.display === 'square')
      ) {
        const newCropEffect = await PictureCropperDialog.show({
          imageUrl: picture.fileDataUrl,
          areaType: this.props.display,
        });
        if (!newCropEffect) return;
        picture.effects.push(newCropEffect);
      }

      await this.setPicture(picture);
      if (this.props.onChange) await this.props.onChange(picture);
    } catch (error) {
      console.error('Failed to select image', error);
      app.$errorManager.trigger(error as Error);
    }
  }

  private async takePicture() {
    const cameraDataUrl = await app.$cameraPicker.show();
    if (!cameraDataUrl) return;

    const picture: IPicture = {
      cameraDataUrl,
      effects: [],
    };
    if (
      this.props.options!.crop &&
      picture.cameraDataUrl &&
      (this.props.display === 'circle' || this.props.display === 'square')
    ) {
      const newCropEffect = await PictureCropperDialog.show({
        imageUrl: picture.cameraDataUrl,
        areaType: this.props.display,
      });
      if (!newCropEffect) return;
      picture.effects.push(newCropEffect);
    }

    await this.setPicture(picture);
    if (this.props.onChange) await this.props.onChange(picture);
  }

  private async resetPicture() {
    const picture: IPicture = { effects: [] };
    await this.setPicture(picture);
    if (this.props.onChange) await this.props.onChange(picture);
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
    return attributes;
  }

  public override get children(): TJSXElementChildren {
    const { placeholder, imgAlt, imgTitle, options } = this.props;
    const { displayUrl } = this.state;

    let icon: TIconId;
    if (options?.camera) {
      icon = 'toolkit-camera-full';
    } else {
      icon = 'toolkit-image';
    }

    return [
      <ToolkitImage key='image' src={displayUrl || placeholder!} alt={imgAlt} title={imgTitle} />,
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
