import { Crop } from 'react-image-crop';
import { classNames, getCroppedArtworkBase64 } from 'mn-tools';
import {
  IContainerProps,
  IContainerState,
  Container,
  Spinner,
  Image,
  VerticalStack,
  FileInput,
  HorizontalStack,
  CheckBox,
  Button,
  Typography,
  NumberInput,
} from 'mn-toolkit';

interface IArtworkEditingProps extends IContainerProps {
  artworkURL: string;
  artworkBase64: string;
  keepRatio: boolean;
  pendulumRatio: boolean;
  hasPendulumFrame: boolean;
  hasLinkFrame: boolean;
  isRush: boolean;
  crop: Crop;
  onKeepRatioChange: (keepRatio: boolean) => void;
  onCroppingChange: (crop: Crop) => void;
  onArtworkURLChange: (url: string) => void | Promise<void>;
  onValidate: (url: string, crop: Crop, keepRatio: boolean) => void | Promise<void>;
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
      fill: true,
      scroll: true,
      gutter: true,
    };
  }

  public constructor(props: IArtworkEditingProps) {
    super(props);
    this.state = {
      ...this.state,
      loaded: true,
      artworkURL: props.artworkURL,
      crop: props.crop,
      croppedArtworkBase64: '',
      keepRatio: props.keepRatio,
    };
    app.$errorManager.handlePromise(this.load());
  }

  public componentDidUpdate(prevProps: IArtworkEditingProps) {
    if (prevProps === this.props) return;
    app.$errorManager.handlePromise(this.load());
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

  private async onCropXChange(x: number) {
    if (x > 100) {
      x = 100;
    } else if (x < 0) {
      x = 0;
    }
    await this.setStateAsync({ crop: { ...this.state.crop, x } });
    if (this.props.onCroppingChange) this.props.onCroppingChange(this.state.crop);
  }

  private async onCropYChange(y: number) {
    if (y > 100) {
      y = 100;
    } else if (y < 0) {
      y = 0;
    }
    await this.setStateAsync({ crop: { ...this.state.crop, y } });
    if (this.props.onCroppingChange) this.props.onCroppingChange(this.state.crop);
  }

  private async onCropWidthChange(width: number) {
    if (width < 1) {
      width = 1;
    }
    const crop = { ...this.state.crop, width };
    if (this.state.keepRatio && crop.width !== crop.height) {
      crop.height = width;
    }
    await this.setStateAsync({ crop });
    if (this.props.onCroppingChange) this.props.onCroppingChange(this.state.crop);
  }

  private async onCropHeightChange(height: number) {
    if (height < 1) {
      height = 1;
    }
    const crop = { ...this.state.crop, height };
    if (this.state.keepRatio && crop.height !== crop.width) {
      crop.width = height;
    }
    await this.setStateAsync({ crop });
    if (this.props.onCroppingChange) this.props.onCroppingChange(this.state.crop);
  }

  private async doSelectImgPath() {
    const path = await window.electron.ipcRenderer.getFilePath(
      this.state.artworkURL || app.$settings.settings.defaultArtworkPath
    );
    if (!path) return;
    await this.onArtworkURLChange(path);
  }

  private async switchKeepRatio() {
    await this.setStateAsync({ keepRatio: !this.state.keepRatio });
    if (this.props.onKeepRatioChange) this.props.onKeepRatioChange(this.state.keepRatio);

    if (!this.state.keepRatio) return;
    if (this.state.crop.height > this.state.crop.width) {
      await this.onCropHeightChange(this.state.crop.width);
    } else if (this.state.crop.height < this.state.crop.width) {
      await this.onCropWidthChange(this.state.crop.height);
    }
  }

  private async setFullCardPreset() {
    await this.setStateAsync({ crop: app.$card.getFullCardPreset() });
    if (this.props.onCroppingChange) this.props.onCroppingChange(this.state.crop);
  }

  private async setFullPendulumCardPreset() {
    await this.setStateAsync({ crop: app.$card.getFullPendulumCardPreset() });
    if (this.props.onCroppingChange) this.props.onCroppingChange(this.state.crop);
  }

  private async setFullRushCardPreset() {
    await this.setStateAsync({ crop: app.$card.getFullRushCardPreset() });
    if (this.props.onCroppingChange) this.props.onCroppingChange(this.state.crop);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['artwork-editing'] = true;
    return classes;
  }

  public override get children() {
    if (!this.state.loaded) return <Spinner />;
    return [
      app.$device.isDesktop && (
        <FileInput
          key='file-input'
          placeholder="Chemin vers l'artwork"
          defaultValue={this.state.artworkURL}
          onChange={(url) => this.onArtworkURLChange(url)}
          overrideOnTap={() => this.doSelectImgPath()}
        />
      ),

      !!this.state.croppedArtworkBase64?.length && (
        <Image
          key='loaded-cropped-img'
          src={this.state.croppedArtworkBase64}
          className={classNames('cropped-img', { 'pendulum-ratio': this.props.pendulumRatio })}
          alt='cropped-img'
        />
      ),

      !this.state.croppedArtworkBase64?.length && <div key='empty-cropped-img' className='cropped-img' />,

      <HorizontalStack key='ratio-checkbox' className='ratio-checkbox' verticalItemAlignment='middle' gutter>
        <CheckBox
          fill
          label='Conserver le ratio'
          defaultValue={this.state.keepRatio}
          onChange={() => this.switchKeepRatio()}
        />

        <Button
          className='full-card'
          label='Preset carte entière'
          onTap={() => (this.props.isRush ? this.setFullRushCardPreset() : this.setFullCardPreset())}
        />

        {!this.props.isRush && (
          <Button
            className='full-pendulum-card'
            label='Preset Carte Pendule entière'
            onTap={() => this.setFullPendulumCardPreset()}
          />
        )}
      </HorizontalStack>,

      <HorizontalStack key='size-fields' gutter>
        <VerticalStack gutter fill>
          <VerticalStack className='size-field'>
            <Typography variant='help' content='X' />
            <NumberInput fill defaultValue={this.state.crop.x} onChange={(x) => this.onCropXChange(x)} />
          </VerticalStack>

          <VerticalStack className='size-field'>
            <Typography variant='help' content='Y' />
            <NumberInput
              fill
              placeholder='Y'
              defaultValue={this.state.crop.y}
              onChange={(y) => this.onCropYChange(y)}
            />
          </VerticalStack>
        </VerticalStack>

        <VerticalStack gutter fill>
          <VerticalStack className='size-field'>
            <Typography variant='help' content='Largeur' />
            <NumberInput
              fill
              defaultValue={this.state.crop.width}
              onChange={(width) => this.onCropWidthChange(width)}
            />
          </VerticalStack>

          <VerticalStack className='size-field'>
            <Typography variant='help' content='Hauteur' />
            <NumberInput
              fill
              defaultValue={this.state.crop.height}
              onChange={(height) => this.onCropHeightChange(height)}
            />
          </VerticalStack>
        </VerticalStack>
      </HorizontalStack>,

      <HorizontalStack key='validate-btn' itemAlignment='center' className='validate'>
        <Button
          label='OK'
          color='positive'
          onTap={() => this.props.onValidate(this.state.artworkURL, this.state.crop, this.state.keepRatio)}
        />
      </HorizontalStack>,
    ];
  }
}
