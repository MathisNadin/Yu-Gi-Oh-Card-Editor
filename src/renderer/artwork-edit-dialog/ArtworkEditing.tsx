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
import { handlePromise } from 'mn-toolkit/error-manager/ErrorManager';

interface IArtworkEditingProps extends IContainableProps {
  artworkURL: string;
  artworkBase64: string;
  hasPendulumFrame: boolean;
  hasLinkFrame: boolean;
  crop: Crop;
  onCroppingChange: (crop: Crop) => void;
  onArtworkURLChange: (url: string) => void;
}

interface IArtworkEditingState extends IContainableState {
  artworkURL: string;
  crop: Crop;
  croppedArtworkBase64: string;
}

export class ArtworkEditing extends Containable<IArtworkEditingProps, IArtworkEditingState> {

  public constructor(props: IArtworkEditingProps) {
    super(props);
    this.state = {
      loaded: true,
      artworkURL: props.artworkURL,
      crop: props.crop,
      croppedArtworkBase64: ''
    }
    handlePromise(this.load(props));
  }

  public componentWillReceiveProps(nextProps: IArtworkEditingProps, _prevState: IArtworkEditingState) {
    handlePromise(this.load(nextProps));
  }

  private async load(props: IArtworkEditingProps) {
    const croppedArtworkBase64 = await this.getCroppedArtworkBase64(props.artworkBase64, props.crop);
    this.setState({
      crop: props.crop,
      artworkURL: props.artworkURL,
      croppedArtworkBase64
    });
  }

  private async getCroppedArtworkBase64(src: string, crop: Crop) {
    if (!src?.length) return '';
    const image = new Image();
    image.src = src;
    await new Promise<void>(resolve => {
      image.onload = () => {
        resolve();
      };
    });
    const canvas = document.createElement('canvas');
    canvas.width = image.width * crop.width / 100;
    canvas.height = image.height * crop.height / 100;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.drawImage(
      image,
      image.width * crop.x / 100,
      image.width * crop.y / 100,
      canvas.width, canvas.height,
      0, 0, canvas.width, canvas.height
    );
    return canvas.toDataURL();
  }

  private onArtworkURLChange(artworkURL: string) {
    if (!artworkURL) return;
    this.setState({ artworkURL });
    if (this.props.onArtworkURLChange) this.props.onArtworkURLChange(artworkURL);
  }

  private onCroppingChange(crop: Crop) {
    this.setState({ crop });
    if (this.props.onCroppingChange) this.props.onCroppingChange(crop);
  }

  public render() {
    if (!this.state?.loaded) return <div></div>;
    return this.renderAttributes(<VerticalStack>
        <HorizontalStack className='artwork-path'>
          <p className='path-label'>Chemin :</p>
          <input type='text' className='path-text-input' value={this.state.artworkURL} onInput={e => this.onArtworkURLChange((e.target as EventTargetWithValue).value)} />
          <button type='button' className='path-btn' onClick={() => document.getElementById('path-hidden-input')?.click()}>...</button>
          <input type='file' accept='image/*' id='path-hidden-input' className='path-hidden-input' onChange={e => this.onArtworkURLChange((e.target.files as FileList)[0]?.path)} />
        </HorizontalStack>

        {this.state.croppedArtworkBase64?.length && <img src={this.state.croppedArtworkBase64} className='cropped-img' alt='cropped-img' />}
    </VerticalStack>, 'artwork-editing');
  }
}
