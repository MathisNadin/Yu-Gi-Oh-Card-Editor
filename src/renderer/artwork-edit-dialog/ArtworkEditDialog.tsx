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
import { HorizontalStack } from 'mn-toolkit/container/HorizontalStack';
import { handlePromise } from 'mn-toolkit/error-manager/ErrorManager';
import { isEmpty } from 'mn-toolkit/tools';
import { Crop } from 'react-image-crop';
import { ArtworkCropping } from './ArtworkCropping';
import { ArtworkEditing } from './ArtworkEditing';
import './styles.css';

interface IArtworkEditDialogProps extends IContainableProps {
  artworkURL: string;
  hasPendulumFrame: boolean;
  hasLinkFrame: boolean;
  onArtworkURLChange: (url: string) => void;
}

interface IArtworkEditDialogState extends IContainableState {
  artworkURL: string;
  artworkBase64: string;
  crop: Crop;
}

export class ArtworkEditDialog extends Containable<IArtworkEditDialogProps, IArtworkEditDialogState> {

  public constructor(props: IArtworkEditDialogProps) {
    super(props);
    this.state = {
      loaded: true,
      artworkURL: props.artworkURL,
      artworkBase64: '',
      crop: {
        x: 0,
        y: 0,
        height: 100,
        width: 100,
        unit: '%'
      }
    }
  }

  public componentDidMount() {
    handlePromise(this.loadArtworkBase64());
  }

  public componentWillReceiveProps(_nextProps: IArtworkEditDialogProps, _prevState: IArtworkEditDialogState) {
    handlePromise(this.loadArtworkBase64());
  }

  private async loadArtworkBase64(artworkURL?: string) {
    artworkURL = artworkURL || this.state.artworkURL;

    let artworkBase64 = '';
    if (!isEmpty(artworkURL) && await window.electron.ipcRenderer.checkFileExists(artworkURL)) {
      artworkBase64 = await window.electron.ipcRenderer.createImgFromPath(artworkURL);
    }

    const state: IArtworkEditDialogState = {
      loaded: true,
      artworkURL,
      artworkBase64,
      crop: this.state?.crop || {
        x: 0,
        y: 0,
        height: 100,
        width: 100,
        unit: '%'
      }
    }

    if (this.state) {
      this.setState(state);
    } else {
      this.state = state;
    }
  }

  public render() {
    if (!this.state?.loaded) return <div></div>;
    return this.renderAttributes(<HorizontalStack>
      <ArtworkCropping
        artworkBase64={this.state.artworkBase64}
        hasPendulumFrame={this.props.hasPendulumFrame}
        hasLinkFrame={this.props.hasLinkFrame}
        crop={this.state.crop}
        onCroppingChange={crop => this.setState({ crop })} />

      <ArtworkEditing
        artworkURL={this.state.artworkURL}
        artworkBase64={this.state.artworkBase64}
        hasPendulumFrame={this.props.hasPendulumFrame}
        hasLinkFrame={this.props.hasLinkFrame}
        crop={this.state.crop}
        onCroppingChange={crop => this.setState({ crop })}
        onArtworkURLChange={url => handlePromise(this.loadArtworkBase64(url))} />
    </HorizontalStack>, 'artwork-edit-dialog');
  }
}
