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
import './styles.css';
import { HorizontalStack } from 'mn-toolkit/container/HorizontalStack';
import { VerticalStack } from 'mn-toolkit/container/VerticalStack';
import { handlePromise } from 'mn-toolkit/error-manager/ErrorManager';
import { integer, isEmpty } from 'mn-toolkit/tools';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/src/ReactCrop.scss'
import { Container, EventTargetWithValue } from 'mn-toolkit/container/Container';

interface IArtworkEditDialogProps extends IContainableProps {
  artworkURL: string;
  hasPendulumFrame: boolean;
  hasLinkFrame: boolean;
  onArtworkURLChange: (url: string) => void;
}

interface IArtworkEditDialogState extends IContainableState {
  artwork: string;
  higher: boolean;
  crop: Crop;
}

export class ArtworkEditDialog extends Containable<IArtworkEditDialogProps, IArtworkEditDialogState> {

  public constructor(props: IArtworkEditDialogProps) {
    super(props);
    this.state = {
      loaded: true,
      artwork: '',
      higher: false,
      crop: {
        x: 0,
        y: 0,
        height: 100,
        width: 100,
        unit: '%'
      }
    }
    handlePromise(this.load());
  }

  public componentWillReceiveProps(_nextProps: IArtworkEditDialogProps, _prevState: IArtworkEditDialogState) {
    handlePromise(this.load());
  }

  private async load() {
    let artwork = '';
    let higher = false;

    let needForceUpdate = false;
    let artworkExists = false;
    if (!isEmpty(this.props.artworkURL)) {
      needForceUpdate = true;
      artworkExists = await window.electron.ipcRenderer.checkFileExists(this.props.artworkURL);
    }

    if (artworkExists) {
      artwork = `file://${this.props.artworkURL}`;
      artwork = await window.electron.ipcRenderer.createImgFromPath(this.props.artworkURL);
      higher = this.imgIsHigher(artwork);
    }

    this.setState({
      loaded: true,
      higher,
      artwork,
    });
  }

  private imgIsHigher(base64: string): boolean {
    const image = new Image();
    image.src = base64;
    return image.height > image.width;
  }

  public render() {
    if (!this.state?.loaded) return <div></div>;
    return this.renderAttributes(<HorizontalStack>
      <Container className='artwork-cropping'>
        {!!this.state.artwork.length &&
          <ReactCrop className={`cropping-interface ${this.state.higher ? 'higher' : ''}`} crop={this.state.crop} onChange={(crop: Crop) => this.setState({ crop })}>
            <img className='artwork-img' src={this.state.artwork} alt='artwork' />
          </ReactCrop>
        }
      </Container>

      <VerticalStack className='artwork-editing'>
        <HorizontalStack className='artwork-path'>
          <p className='path-label'>Chemin :</p>
          <input type='text' className='path-text-input' value={this.props.artworkURL} onInput={e => this.props.onArtworkURLChange && this.props.onArtworkURLChange((e.target as EventTargetWithValue).value)} />
          <button type='button' className='path-btn' onClick={() => document.getElementById('path-hidden-input')?.click()}>...</button>
          <input type='file' accept='image/*' id='path-hidden-input' className='path-hidden-input' onChange={e => this.props.onArtworkURLChange && this.props.onArtworkURLChange((e.target.files as FileList)[0].path)} />
        </HorizontalStack>
      </VerticalStack>
    </HorizontalStack>, 'artwork-edit-dialog');
  }
}
