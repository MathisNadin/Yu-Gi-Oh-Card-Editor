/* eslint-disable prefer-const */
/* eslint-disable no-undef */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable lines-between-class-members */
/* eslint-disable global-require */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react/default-props-match-prop-types */
/* eslint-disable react/sort-comp */
/* eslint-disable react/static-property-placement */
/* eslint-disable no-use-before-define */
/* eslint-disable react/require-default-props */
/* eslint-disable no-useless-constructor */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable import/prefer-default-export */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { IContainableProps, IContainableState, Containable } from 'mn-toolkit/containable/Containable';
import { Crop } from 'react-image-crop';
import { EventTargetWithValue } from 'mn-toolkit/container/Container';
import { HorizontalStack } from 'mn-toolkit/container/HorizontalStack';
import { VerticalStack } from 'mn-toolkit/container/VerticalStack';
import './styles.css';
import { classNames, getCroppedArtworkBase64 } from 'mn-toolkit/tools';
import { Spinner } from 'mn-toolkit/spinner/Spinner';

interface IArtworkEditingProps extends IContainableProps {
  artworkURL: string;
  artworkBase64: string;
  keepRatio: boolean;
  pendulumRatio: boolean;
  hasPendulumFrame: boolean;
  hasLinkFrame: boolean;
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
      loaded: true,
      artworkURL: props.artworkURL,
      crop: props.crop,
      croppedArtworkBase64: '',
      keepRatio: props.keepRatio
    }
    app.$errorManager.handlePromise(this.load(props));
  }

  public componentWillReceiveProps(nextProps: IArtworkEditingProps, _prevState: IArtworkEditingState) {
    app.$errorManager.handlePromise(this.load(nextProps));
  }

  private async load(props: IArtworkEditingProps) {
    const croppedArtworkBase64 = await getCroppedArtworkBase64(props.artworkBase64, props.crop);
    this.setState({
      crop: props.crop,
      artworkURL: props.artworkURL,
      croppedArtworkBase64,
      keepRatio: props.keepRatio
    });
  }

  private onArtworkURLChange(artworkURL: string) {
    if (!artworkURL) return;
    const crop: Crop = {
      x: 0,
      y: 0,
      height: 100,
      width: 100,
      unit: '%'
    };
    this.setState({ artworkURL, crop });
    if (this.props.onArtworkURLChange) this.props.onArtworkURLChange(artworkURL);
  }

  private onCropXChange(x: number) {
    if (x > 100) {
      x = 100;
    } else if (x < 0) {
      x = 0;
    }
    const crop = this.state.crop;
    crop.x = x;
    this.setState({ crop });
    if (this.props.onCroppingChange) this.props.onCroppingChange(crop);
  }

  private onCropYChange(y: number) {
    if (y > 100) {
      y = 100;
    } else if (y < 0) {
      y = 0;
    }
    const crop = this.state.crop;
    crop.y = y;
    this.setState({ crop });
    if (this.props.onCroppingChange) this.props.onCroppingChange(crop);
  }

  private onCropWidthChange(width: number) {
/*     if (width > 100) {
      width = 100;
    } else */
    if (width < 1) {
      width = 1;
    }
    const crop = this.state.crop;
    crop.width = width;
    if (this.state.keepRatio && crop.width !== crop.height) {
      crop.height = width;
    }
    this.setState({ crop });
    if (this.props.onCroppingChange) this.props.onCroppingChange(crop);
  }

  private onCropHeightChange(height: number) {
/*     if (height > 100) {
      height = 100;
    } else */
    if (height < 1) {
      height = 1;
    }
    const crop = this.state.crop;
    crop.height = height;
    if (this.state.keepRatio && crop.height !== crop.width) {
      crop.width = height;
    }
    this.setState({ crop });
    if (this.props.onCroppingChange) this.props.onCroppingChange(crop);
  }

  private async doSelectImgPath() {
    const path = await window.electron.ipcRenderer.getFilePath();
    if (!path) return;
    this.onArtworkURLChange(path);
  }

  private switchKeepRatio() {
    let keepRatio = !this.state.keepRatio;
    this.setState({ keepRatio });
    if (this.props.onKeepRatioChange) this.props.onKeepRatioChange(keepRatio);

    if (keepRatio) {
      if (this.state.crop.height > this.state.crop.width) {
        this.onCropHeightChange(this.state.crop.width);
      }
      else if (this.state.crop.height < this.state.crop.width) {
        this.onCropWidthChange(this.state.crop.height);
      }
    }
  }

  private setFullCardPreset() {
    let crop: Crop = {
      x: 12.45,
      y: 18.35,
      width: 75.3,
      height: 51.85,
      unit: '%'
    };
    this.setState({ crop });
    if (this.props.onCroppingChange) this.props.onCroppingChange(crop);
  }

  private setFullPendulumCardPreset() {
    let crop: Crop = {
      x: 7.15,
      y: 18.25,
      width: 85.75,
      height: 44,
      unit: '%'
    };
    this.setState({ crop });
    if (this.props.onCroppingChange) this.props.onCroppingChange(crop);
  }

  public render() {
    if (!this.state?.loaded) return <Spinner />;
    return this.renderAttributes(<VerticalStack fill scroll>
        <HorizontalStack className='artwork-path'>
          <p className='path-label'>Chemin :</p>
          <input type='text' className='path-text-input' value={this.state.artworkURL} onInput={e => this.onArtworkURLChange((e.target as EventTargetWithValue).value)} />
          <button type='button' className='path-btn' onClick={() => app.$errorManager.handlePromise(this.doSelectImgPath())}>...</button>
        </HorizontalStack>

        {this.state.croppedArtworkBase64?.length
          ? <img src={this.state.croppedArtworkBase64} className={classNames('cropped-img', { 'pendulum-ratio': this.props.pendulumRatio })} alt='cropped-img' />
          : <div className='cropped-img' />
        }

        <HorizontalStack className='ratio-checkbox'>
          <input type='checkbox' className='ratio-input' checked={this.state.keepRatio} onChange={() => this.switchKeepRatio()} />
          <p className='editor-label pendulum-label'>Conserver le ratio</p>
          <button type='button' className='preset-btn full-card-preset-btn' onClick={() => this.setFullCardPreset()}>Preset carte entière</button>
          <button type='button' className='preset-btn full-pendulum-card-preset-btn' onClick={() => this.setFullPendulumCardPreset()}>Preset Carte Pendule entière</button>
        </HorizontalStack>

        <HorizontalStack className='ratio-section'>
          <VerticalStack className='ratio-column ratio-column-1'>
            <HorizontalStack className='ratio-crop-data ratio-x'>
              <p className='ratio-label ratio-x-label'>X</p>
              <input type='number' className='ratio-input ratio-x-input' value={this.state.crop.x} onInput={e => this.onCropXChange(parseFloat((e.target as EventTargetWithValue).value))} />
            </HorizontalStack>

            <HorizontalStack className='ratio-crop-data ratio-y'>
              <p className='ratio-label ratio-y-label'>Y</p>
              <input type='number' className='ratio-input ratio-y-input' value={this.state.crop.y} onInput={e => this.onCropYChange(parseFloat((e.target as EventTargetWithValue).value))} />
            </HorizontalStack>
          </VerticalStack>

          <VerticalStack className='ratio-column ratio-column-2'>
            <HorizontalStack className='ratio-crop-data ratio-width'>
              <p className='ratio-label ratio-width-label'>Largeur</p>
              <input type='number' className='ratio-input ratio-width-input' value={this.state.crop.width} onInput={e => this.onCropWidthChange(parseFloat((e.target as EventTargetWithValue).value))} />
            </HorizontalStack>

            <HorizontalStack className='ratio-crop-data ratio-height'>
              <p className='ratio-label ratio-height-label'>Hauteur</p>
              <input type='number' className='ratio-input ratio-height-input' value={this.state.crop.height} onInput={e => this.onCropHeightChange(parseFloat((e.target as EventTargetWithValue).value))} />
            </HorizontalStack>
          </VerticalStack>
        </HorizontalStack>

        <button type='button' className='validate-btn' onClick={() => this.props.onValidate(this.state.artworkURL, this.state.crop, this.state.keepRatio)}>OK</button>
    </VerticalStack>, 'artwork-editing');
  }
}
