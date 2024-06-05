import emptyPictureUrl from 'assets/images/picture-placeholder.png';
import { IFileCropEffect, IFileEffect } from 'api/main';
import { IContainerProps, IContainerState, Container, VerticalStack } from '../container';
import { JSXElementChildren } from '../react';
import { Image as ToolkitImage } from '../image';
import { Toolbar } from '../toolbar';
import { PictureCropperDialog } from './PictureCropperDialog';
import { Icon } from '../icon';

export interface IPicture {
  oid?: number;
  url: string;
  effects: IFileEffect[];
  changed: boolean;
}

export interface IPictureEditorProps extends IContainerProps {
  emptyPictureUrl: string;
  defaultValue?: IPicture;
  hideToolbar?: boolean;
  camera?: boolean;
  file?: boolean;
  onChange?: (value: IPicture) => void | Promise<void>;
}

interface IPictureEditorState extends IContainerState {
  picture: IPicture;
  croppedImageUrl?: string;
}

export class PictureEditor extends Container<IPictureEditorProps, IPictureEditorState> {
  public static get defaultProps(): IPictureEditorProps {
    return {
      ...super.defaultProps,
      emptyPictureUrl,
      camera: false,
      file: true,
      hideToolbar: false,
      layout: 'vertical',
    };
  }

  public constructor(props: IPictureEditorProps) {
    super(props);
    this.state = {
      ...this.state,
      picture: this.props.defaultValue || { url: '', effects: [], changed: false },
    };
  }

  public componentDidMount() {
    if (this.state.croppedImageUrl) return;
    this.applyCroppingEffect(this.state.picture)
      .then((croppedImageUrl) => this.setState({ croppedImageUrl }))
      .catch((e) => app.$errorManager.trigger(e));
  }

  public componentDidUpdate(prevProps: IPictureEditorProps) {
    if (
      (!this.props.defaultValue && !prevProps.defaultValue) ||
      this.props.defaultValue === prevProps.defaultValue ||
      this.props.defaultValue === this.state.picture
    ) {
      return;
    }

    if (!this.props.defaultValue || this.props.defaultValue.effects === this.state.picture.effects) {
      this.setState({ picture: this.props.defaultValue || { url: '', effects: [], changed: false } });
    } else {
      this.applyCroppingEffect(this.props.defaultValue)
        .then((croppedImageUrl) => this.setState({ picture: this.props.defaultValue!, croppedImageUrl }))
        .catch((e) => app.$errorManager.trigger(e));
    }
  }

  private async applyCroppingEffect(picture: IPicture) {
    if (picture.oid) return undefined;

    const cropEffect = picture.effects.find((e) => e.uuid === PictureCropperDialog.EFFECT_ID) as
      | IFileCropEffect
      | undefined;
    if (!cropEffect) return undefined;

    const img = new Image();
    img.src = picture.url;
    return await new Promise<string | undefined>((resolve, reject) => {
      img.onload = () => {
        // Créer un élément canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(undefined);
          return;
        }

        // Définir les dimensions du canvas pour correspondre aux dimensions recadrées
        canvas.width = cropEffect.crop.width;
        canvas.height = cropEffect.crop.height;

        // Dessiner l'image recadrée sur le canvas
        // Les paramètres sont: image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
        ctx.drawImage(
          img,
          cropEffect.crop.left * 1,
          cropEffect.crop.top * 1,
          cropEffect.crop.width,
          cropEffect.crop.height,
          0,
          0,
          cropEffect.crop.width,
          cropEffect.crop.height
        );
        this.containerRef.current?.appendChild(img);
        this.containerRef.current?.appendChild(canvas);

        // Convertir le canvas en URL de données
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = (e) => {
        const error = new Error(e as string);
        app.$errorManager.trigger(error);
        reject(error);
      };
    });
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-picture-editor'] = true;
    return classes;
  }

  public get children(): JSXElementChildren {
    const { picture, croppedImageUrl } = this.state;
    const url = croppedImageUrl || picture.url;
    return [
      <VerticalStack className='mn-picture-holder' key='picture-holder'>
        {!!url && <ToolkitImage src={url} alt='image' onTap={() => app.$gallery.show({ images: [{ url }] })} />}

        {!url && <ToolkitImage src={this.props.emptyPictureUrl} alt='empty-url' />}
      </VerticalStack>,

      !this.props.hideToolbar && <Toolbar key='toolbar'>{this.tools}</Toolbar>,
    ];
  }

  private get tools() {
    return [
      this.props.camera && (
        <Icon key='camera' iconId='toolkit-camera' hint='Prendre une photo' onTap={() => this.doAction('camera')} />
      ),
      this.props.file && (
        <Icon key='file' hint='Chercher sur cet appareil' iconId='toolkit-image' onTap={() => this.doAction('file')} />
      ),
      <Icon key='trash' iconId='toolkit-trash' hint="Supprimer l'image" onTap={() => this.doAction('clean')} />,
    ];
  }

  public async doAction(action: 'camera' | 'file' | 'clean') {
    let picture = { ...this.state.picture };
    let croppedImageUrl: string | undefined;
    switch (action) {
      /* case 'camera':
        picture.url = await app.$cameraPicker.show({});
        if (!picture.url) return;
        picture.oid = undefined;
        let cropEffect = picture.effects.find((e) => e.uuid === PictureCropperDialog.EFFECT_ID) as
          | IFileCropEffect
          | undefined;
        cropEffect = await PictureCropperDialog.show({ imageUrl: picture.url, cropEffect });
        if (cropEffect) {
          picture.effects = [cropEffect];
        } else {
          picture.effects = [];
        }
          croppedImageUrl = await this.applyCroppingEffect(picture.url, cropEffect);
        break; */

      case 'file':
        picture.url = (await app.$filePicker.show({ outputType: 'url', accept: '.png,.jpg,.jpeg,.gif' })) as string;
        if (!picture.url) return;
        picture.oid = undefined;
        let cropEffect = picture.effects.find((e) => e.uuid === PictureCropperDialog.EFFECT_ID) as
          | IFileCropEffect
          | undefined;
        cropEffect = await PictureCropperDialog.show({ imageUrl: picture.url, cropEffect });
        if (cropEffect) {
          picture.effects = [cropEffect];
        } else {
          picture.effects = [];
        }
        croppedImageUrl = await this.applyCroppingEffect(picture);
        break;

      case 'clean':
        picture.url = '';
        picture.effects = [];
        break;

      default:
        return;
    }

    picture.changed = true;
    await this.setStateAsync({ picture, croppedImageUrl });
    if (this.props.onChange) this.props.onChange(this.state.picture);
  }
}
