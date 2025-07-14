import { Crop } from 'react-image-crop';
import { classNames, getCroppedArtworkBase64 } from 'mn-tools';
import {
  IContainerProps,
  IContainerState,
  Container,
  Spinner,
  Image,
  VerticalStack,
  FilePathInput,
  HorizontalStack,
  Checkbox,
  Button,
  TDidUpdateSnapshot,
  NumberInputField,
  Typography,
  Spacer,
} from 'mn-toolkit';

interface IArtworkEditingProps extends IContainerProps {
  artworkURL: string;
  artworkBase64: string;
  keepRatio: boolean;
  pendulumRatio: boolean;
  isRush: boolean;
  crop: Crop;
  onKeepRatioChange: (keepRatio: boolean) => void | Promise<void>;
  onCroppingChange: (crop: Crop) => void | Promise<void>;
  onArtworkURLChange: (url: string) => void | Promise<void>;
}

interface IArtworkEditingState extends IContainerState {
  artworkURL: string;
  crop: Crop;
  croppedArtworkBase64: string;
  keepRatio: boolean;
}

export class ArtworkEditing extends Container<IArtworkEditingProps, IArtworkEditingState> {
  public static override get defaultProps(): Partial<IArtworkEditingProps> {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      gutter: true,
    };
  }

  public constructor(props: IArtworkEditingProps) {
    super(props);
    this.state = {
      ...this.state,
      artworkURL: props.artworkURL,
      crop: props.crop,
      croppedArtworkBase64: '',
      keepRatio: props.keepRatio,
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    app.$errorManager.handlePromise(this.load());
  }

  public override componentDidUpdate(
    prevProps: Readonly<IArtworkEditingProps>,
    prevState: Readonly<IArtworkEditingState>,
    snapshot?: TDidUpdateSnapshot
  ): void {
    super.componentDidUpdate(prevProps, prevState, snapshot);

    // Déclenche le rechargement seulement si une des props suivantes a changé
    const shouldReload =
      prevProps.artworkURL !== this.props.artworkURL ||
      prevProps.artworkBase64 !== this.props.artworkBase64 ||
      prevProps.keepRatio !== this.props.keepRatio ||
      !this.isCropDeepEqual(prevProps.crop, this.props.crop);

    if (shouldReload) app.$errorManager.handlePromise(this.load());
  }

  // Utilitaire pour comparer deux objets crop
  private isCropDeepEqual(a: Crop, b: Crop): boolean {
    if (a !== b) return false;
    if (!a || !b) return false;
    return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height && a.unit === b.unit;
  }

  private async load() {
    const croppedArtworkBase64 = await getCroppedArtworkBase64({
      src: this.props.artworkBase64,
      height: this.props.crop.height,
      width: this.props.crop.width,
      x: this.props.crop.x,
      y: this.props.crop.y,
    });
    await this.setStateAsync({
      loaded: true,
      crop: this.props.crop,
      artworkURL: this.props.artworkURL,
      croppedArtworkBase64,
      keepRatio: this.props.keepRatio,
    });
  }

  private async onArtworkURLChange(artworkURL: string) {
    const crop: Crop = {
      x: 0,
      y: 0,
      height: 100,
      width: 100,
      unit: '%',
    };
    await this.setStateAsync({ artworkURL, crop });
    if (this.props.onArtworkURLChange) await this.props.onArtworkURLChange(this.state.artworkURL);
  }
  private async onCropPropertyChange(property: 'x' | 'y' | 'width' | 'height', value: number) {
    let { x, y, width, height, unit } = this.state.crop;
    const max = 100;

    // Appliquer les limites
    if (property === 'x' || property === 'y') {
      value = Math.min(Math.max(0, value), max);
    } else if (property === 'width' || property === 'height') {
      value = Math.min(Math.max(1, value), max);
    }

    switch (property) {
      case 'x':
        x = value;
        if (x + width > max) {
          width = max - x;
          if (width < 1) width = 1;
        }
        break;

      case 'y':
        y = value;
        if (y + height > max) {
          height = max - y;
          if (height < 1) height = 1;
        }
        break;

      case 'width':
        width = value;
        width = Math.min(Math.max(1, width), max);
        if (x + width > max) {
          x = max - width;
          if (x < 0) x = 0;
        }
        if (this.state.keepRatio) {
          height = width;
          if (y + height > max) {
            y = max - height;
            if (y < 0) y = 0;
          }
        }
        break;

      case 'height':
        height = value;
        height = Math.min(Math.max(1, height), max);
        if (y + height > max) {
          y = max - height;
          if (y < 0) y = 0;
        }
        if (this.state.keepRatio) {
          width = height;
          if (x + width > max) {
            x = max - width;
            if (x < 0) x = 0;
          }
        }
        break;
    }

    x = Math.min(Math.max(0, x), max);
    y = Math.min(Math.max(0, y), max);

    const crop = { unit, x, y, width, height };
    await this.setStateAsync({ crop });
    if (this.props.onCroppingChange) await this.props.onCroppingChange(crop);
  }

  private async doSelectImgPath() {
    if (!app.$device.isElectron(window)) return;
    const path = await window.electron.ipcRenderer.invoke(
      'getFilePath',
      this.state.artworkURL || app.$settings.settings.defaultArtworkPath
    );
    if (!path) return;
    await this.onArtworkURLChange(path);
  }

  private async switchKeepRatio() {
    await this.setStateAsync({ keepRatio: !this.state.keepRatio });
    if (this.props.onKeepRatioChange) await this.props.onKeepRatioChange(this.state.keepRatio);

    if (!this.state.keepRatio) return;
    if (this.state.crop.height > this.state.crop.width) {
      await this.onCropPropertyChange('height', this.state.crop.width);
    } else if (this.state.crop.height < this.state.crop.width) {
      await this.onCropPropertyChange('width', this.state.crop.height);
    }
  }

  private async setFullCardPreset() {
    await this.setStateAsync({ crop: app.$card.getFullCardPreset() });
    if (this.props.onCroppingChange) await this.props.onCroppingChange(this.state.crop);
  }

  private async setFullPendulumCardPreset() {
    await this.setStateAsync({ crop: app.$card.getFullPendulumCardPreset() });
    if (this.props.onCroppingChange) await this.props.onCroppingChange(this.state.crop);
  }

  private async setFullRushCardPreset() {
    await this.setStateAsync({ crop: app.$card.getFullRushCardPreset() });
    if (this.props.onCroppingChange) await this.props.onCroppingChange(this.state.crop);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['artwork-editing'] = true;
    return classes;
  }

  public override get children() {
    const { loaded, artworkURL, croppedArtworkBase64, crop, keepRatio } = this.state;
    if (!loaded) return <Spinner />;
    return [
      app.$device.isDesktop && (
        <FilePathInput
          key='file-input'
          placeholder="Chemin vers l'artwork"
          value={artworkURL}
          onChange={(url) => this.onArtworkURLChange(url)}
          overrideOnTapIcon={() => this.doSelectImgPath()}
        />
      ),

      !!croppedArtworkBase64?.length && (
        <Image
          key='loaded-cropped-img'
          src={croppedArtworkBase64}
          className={classNames('cropped-img', { 'pendulum-ratio': this.props.pendulumRatio })}
          alt='cropped-img'
        />
      ),

      !!croppedArtworkBase64?.length && (
        <HorizontalStack key='crop-title' itemAlignment='center' verticalItemAlignment='middle'>
          <Typography alignment='center' bold variant='label' contentType='text' content='Apperçu du recadrage' />
        </HorizontalStack>
      ),

      !!croppedArtworkBase64?.length && (
        <HorizontalStack key='ratio-checkbox' itemAlignment='center' verticalItemAlignment='middle' gutter>
          <Spacer />
          <Checkbox label='Conserver le ratio 1:1' value={keepRatio} onChange={() => this.switchKeepRatio()} />
        </HorizontalStack>
      ),

      !!croppedArtworkBase64?.length && (
        <HorizontalStack key='size-fields' gutter wrap>
          <VerticalStack gutter fill>
            <NumberInputField
              fill
              min={0}
              max={100}
              label='X'
              value={crop.x}
              onChange={(x) => this.onCropPropertyChange('x', x || 0)}
            />
            <NumberInputField
              fill
              min={0}
              max={100}
              label='Y'
              value={crop.y}
              onChange={(y) => this.onCropPropertyChange('y', y || 0)}
            />
          </VerticalStack>

          <VerticalStack gutter fill>
            <NumberInputField
              fill
              min={1}
              max={100}
              label='Largeur'
              value={crop.width}
              onChange={(width) => this.onCropPropertyChange('width', width || 0)}
            />
            <NumberInputField
              fill
              min={1}
              max={100}
              label='Hauteur'
              value={crop.height}
              onChange={(height) => this.onCropPropertyChange('height', height || 0)}
            />
          </VerticalStack>
        </HorizontalStack>
      ),

      !!croppedArtworkBase64?.length && (
        <HorizontalStack key='card-preset' verticalItemAlignment='middle' gutter wrap>
          <Button
            color='neutral'
            label='Appliquer'
            onTap={() => (this.props.isRush ? this.setFullRushCardPreset() : this.setFullCardPreset())}
          />
          <Typography
            variant='help'
            contentType='text'
            content='Appliquer les valeurs de cropping par défaut pour une carte entière'
          />
        </HorizontalStack>
      ),

      !!croppedArtworkBase64?.length && !this.props.isRush && (
        <HorizontalStack key='pendulum-card-preset' verticalItemAlignment='middle' gutter wrap>
          <Button color='info' label='Appliquer' onTap={() => this.setFullPendulumCardPreset()} />
          <Typography
            variant='help'
            contentType='text'
            content='Appliquer les valeurs de cropping par défaut pour une Carte Pendule entière'
          />
        </HorizontalStack>
      ),
    ];
  }
}
