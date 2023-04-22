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
import { getCroppedArtworkBase64, integer } from 'mn-toolkit/tools';

interface IArtworkEditingProps extends IContainableProps {
  artworkURL: string;
  artworkBase64: string;
  hasPendulumFrame: boolean;
  hasLinkFrame: boolean;
  crop: Crop;
  onCroppingChange: (crop: Crop) => void;
  onArtworkURLChange: (url: string) => void;
  onValidate: (url: string, crop: Crop) => void;
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
      keepRatio: false
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
      croppedArtworkBase64
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
    if (x < 0) x = 0;
    const crop = this.state.crop;
    crop.x = x;
    this.setState({ crop });
    if (this.props.onCroppingChange) this.props.onCroppingChange(crop);
  }

  private onCropYChange(y: number) {
    if (y < 0) y = 0;
    const crop = this.state.crop;
    crop.y = y;
    this.setState({ crop });
    if (this.props.onCroppingChange) this.props.onCroppingChange(crop);
  }

  private onCropWidthChange(width: number) {
    if (width < 1) width = 1;
    const crop = this.state.crop;
    crop.width = width;
    this.setState({ crop });
    if (this.props.onCroppingChange) this.props.onCroppingChange(crop);
  }

  private onCropHeightChange(height: number) {
    if (height < 1) height = 1;
    const crop = this.state.crop;
    crop.height = height;
    this.setState({ crop });
    if (this.props.onCroppingChange) this.props.onCroppingChange(crop);
  }

  public render() {
    if (!this.state?.loaded) return <div></div>;
    return this.renderAttributes(<VerticalStack fill scroll>
        <HorizontalStack className='artwork-path'>
          <p className='path-label'>Chemin :</p>
          <input type='text' className='path-text-input' value={this.state.artworkURL} onInput={e => this.onArtworkURLChange((e.target as EventTargetWithValue).value)} />
          <button type='button' className='path-btn' onClick={() => document.getElementById('path-hidden-input')?.click()}>...</button>
          <input type='file' accept='image/*' id='path-hidden-input' className='path-hidden-input' onChange={e => this.onArtworkURLChange((e.target.files as FileList)[0]?.path)} />
        </HorizontalStack>

        {this.state.croppedArtworkBase64?.length
          ? <img src={this.state.croppedArtworkBase64} className='cropped-img' alt='cropped-img' />
          : <div className='cropped-img' />
        }

        <HorizontalStack className='ratio-checkbox'>
          <input type='checkbox' className='ratio-input' defaultChecked={this.state.keepRatio} onInput={() => this.setState({ keepRatio: !this.state.keepRatio })} />
          <p className='editor-label pendulum-label'>Conserver le ratio</p>
        </HorizontalStack>

        <HorizontalStack className='ratio-section'>
          <VerticalStack className='ratio-column ratio-column-1'>
            <HorizontalStack className='ratio-crop-data ratio-x'>
              <p className='ratio-label ratio-x-label'>X</p>
              <input type='number' className='ratio-input ratio-x-input' value={this.state.crop.x} onInput={e => this.onCropXChange(integer((e.target as EventTargetWithValue).value))} />
            </HorizontalStack>

            <HorizontalStack className='ratio-crop-data ratio-y'>
              <p className='ratio-label ratio-y-label'>Y</p>
              <input type='number' className='ratio-input ratio-y-input' value={this.state.crop.y} onInput={e => this.onCropYChange(integer((e.target as EventTargetWithValue).value))} />
            </HorizontalStack>
          </VerticalStack>

          <VerticalStack className='ratio-column ratio-column-2'>
            <HorizontalStack className='ratio-crop-data ratio-width'>
              <p className='ratio-label ratio-width-label'>Largeur</p>
              <input type='number' className='ratio-input ratio-width-input' value={this.state.crop.width} onInput={e => this.onCropWidthChange(integer((e.target as EventTargetWithValue).value))} />
            </HorizontalStack>

            <HorizontalStack className='ratio-crop-data ratio-height'>
              <p className='ratio-label ratio-height-label'>Hauteur</p>
              <input type='number' className='ratio-input ratio-height-input' value={this.state.crop.height} onInput={e => this.onCropHeightChange(integer((e.target as EventTargetWithValue).value))} />
            </HorizontalStack>
          </VerticalStack>
        </HorizontalStack>

        <button type='button' className='validate-btn' onClick={() => this.props.onValidate(this.state.artworkURL, this.state.crop)}>OK</button>
    </VerticalStack>, 'artwork-editing');
  }
}
