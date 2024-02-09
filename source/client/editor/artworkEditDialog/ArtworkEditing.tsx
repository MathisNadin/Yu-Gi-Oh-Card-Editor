import { Crop } from 'react-image-crop';
import { classNames, getCroppedArtworkBase64 } from 'libraries/mn-tools';
import {
  IContainableProps,
  IContainableState,
  Containable,
  Spinner,
  Image,
  VerticalStack,
  FileInput,
  HorizontalStack,
  CheckBox,
  Button,
  Typography,
  NumberInput,
} from 'libraries/mn-toolkit';

interface IArtworkEditingProps extends IContainableProps {
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
  onArtworkURLChange: (url: string) => void;
  onValidate: (url: string, crop: Crop, keepRatio: boolean) => void;
}

interface IArtworkEditingState extends IContainableState {
  artworkURL: string;
  crop: Crop;
  croppedArtworkBase64: string;
  keepRatio: boolean;
}

export class ArtworkEditing extends Containable<IArtworkEditingProps, IArtworkEditingState> {
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
    if (prevProps !== this.props) app.$errorManager.handlePromise(this.load());
  }

  private async load() {
    const croppedArtworkBase64 = await getCroppedArtworkBase64(this.props.artworkBase64, this.props.crop);
    this.setState({
      crop: this.props.crop,
      artworkURL: this.props.artworkURL,
      croppedArtworkBase64,
      keepRatio: this.props.keepRatio,
    });
  }

  private onArtworkURLChange(artworkURL: string) {
    if (!artworkURL) return;
    const crop: Crop = {
      x: 0,
      y: 0,
      height: 100,
      width: 100,
      unit: '%',
    };
    this.setState(
      { artworkURL, crop },
      () => !!this.props.onArtworkURLChange && this.props.onArtworkURLChange(this.state.artworkURL)
    );
  }

  private onCropXChange(x: number) {
    if (x > 100) {
      x = 100;
    } else if (x < 0) {
      x = 0;
    }
    const crop = this.state.crop;
    crop.x = x;
    this.setState({ crop }, () => !!this.props.onCroppingChange && this.props.onCroppingChange(this.state.crop));
  }

  private onCropYChange(y: number) {
    if (y > 100) {
      y = 100;
    } else if (y < 0) {
      y = 0;
    }
    const crop = this.state.crop;
    crop.y = y;
    this.setState({ crop }, () => !!this.props.onCroppingChange && this.props.onCroppingChange(this.state.crop));
  }

  private onCropWidthChange(width: number) {
    if (width < 1) {
      width = 1;
    }
    const crop = this.state.crop;
    crop.width = width;
    if (this.state.keepRatio && crop.width !== crop.height) {
      crop.height = width;
    }
    this.setState({ crop }, () => !!this.props.onCroppingChange && this.props.onCroppingChange(this.state.crop));
  }

  private onCropHeightChange(height: number) {
    if (height < 1) {
      height = 1;
    }
    const crop = this.state.crop;
    crop.height = height;
    if (this.state.keepRatio && crop.height !== crop.width) {
      crop.width = height;
    }
    this.setState({ crop }, () => !!this.props.onCroppingChange && this.props.onCroppingChange(this.state.crop));
  }

  private async doSelectImgPath() {
    const path = await window.electron.ipcRenderer.getFilePath(app.$settings.settings.defaultArtworkPath);
    if (!path) return;
    this.onArtworkURLChange(path);
  }

  private switchKeepRatio() {
    this.setState({ keepRatio: !this.state.keepRatio }, () => {
      if (this.props.onKeepRatioChange) this.props.onKeepRatioChange(this.state.keepRatio);

      if (this.state.keepRatio) {
        if (this.state.crop.height > this.state.crop.width) {
          this.onCropHeightChange(this.state.crop.width);
        } else if (this.state.crop.height < this.state.crop.width) {
          this.onCropWidthChange(this.state.crop.height);
        }
      }
    });
  }

  private setFullCardPreset() {
    let crop = app.$card.getFullCardPreset();
    this.setState({ crop }, () => !!this.props.onCroppingChange && this.props.onCroppingChange(this.state.crop));
  }

  private setFullPendulumCardPreset() {
    let crop = app.$card.getFullPendulumCardPreset();
    this.setState({ crop }, () => !!this.props.onCroppingChange && this.props.onCroppingChange(this.state.crop));
  }

  private setFullRushCardPreset() {
    let crop = app.$card.getFullRushCardPreset();
    this.setState({ crop }, () => !!this.props.onCroppingChange && this.props.onCroppingChange(this.state.crop));
  }

  public render() {
    if (!this.state?.loaded) return <Spinner />;
    return this.renderAttributes(
      <VerticalStack fill scroll gutter>
        {app.$device.isDesktop && (
          <FileInput
            placeholder="Chemin vers l'artwork"
            defaultValue={this.state.artworkURL}
            onChange={(url) => this.onArtworkURLChange(url)}
            overrideOnTap={() => this.doSelectImgPath()}
          />
        )}

        {!!this.state.croppedArtworkBase64?.length ? (
          <Image
            src={this.state.croppedArtworkBase64}
            className={classNames('cropped-img', { 'pendulum-ratio': this.props.pendulumRatio })}
            alt='cropped-img'
          />
        ) : (
          <div className='cropped-img' />
        )}

        <HorizontalStack className='ratio-checkbox' verticalItemAlignment='middle' gutter>
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
        </HorizontalStack>

        <HorizontalStack gutter>
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
        </HorizontalStack>

        <HorizontalStack itemAlignment='center' className='validate'>
          <Button
            label='OK'
            color='balanced'
            onTap={() => this.props.onValidate(this.state.artworkURL, this.state.crop, this.state.keepRatio)}
          />
        </HorizontalStack>
      </VerticalStack>,
      'artwork-editing'
    );
  }
}