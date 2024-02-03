import './styles.scss';
import { IContainableState, Containable } from 'libraries/mn-toolkit/containable/Containable';
import { HorizontalStack } from 'libraries/mn-toolkit/container/HorizontalStack';
import { isEmpty } from 'libraries/mn-tools';
import { Crop } from 'react-image-crop';
import { ArtworkCropping } from './ArtworkCropping';
import { ArtworkEditing } from './ArtworkEditing';
import { Spinner } from 'libraries/mn-toolkit/spinner/Spinner';
import { IDialogProps } from 'libraries/mn-toolkit/popup/PopupService';

export interface IArtworkEditDialogResult {
  url: string;
  crop: Crop;
  keepRatio: boolean;
}

interface IArtworkEditDialogProps extends IDialogProps<IArtworkEditDialogResult> {
  artworkURL: string;
  pendulumRatio: boolean;
  hasPendulumFrame: boolean;
  hasLinkFrame: boolean;
  isRush: boolean;
  crop: Crop;
  keepRatio: boolean;
}

interface IArtworkEditDialogState extends IContainableState {
  artworkURL: string;
  artworkBase64: string;
  crop: Crop;
  keepRatio: boolean;
}

export class ArtworkEditDialog extends Containable<IArtworkEditDialogProps, IArtworkEditDialogState> {

  public constructor(props: IArtworkEditDialogProps) {
    super(props);
    this.state = {
      loaded: true,
      artworkURL: props.artworkURL,
      artworkBase64: '',
      crop: props.crop,
      keepRatio: props.keepRatio
    };
  }

  public componentDidMount() {
    app.$errorManager.handlePromise(this.loadArtworkBase64(undefined, true));
  }

  public componentWillReceiveProps(_nextProps: IArtworkEditDialogProps, _prevState: IArtworkEditDialogState) {
    app.$errorManager.handlePromise(this.loadArtworkBase64());
  }

  private async loadArtworkBase64(artworkURL?: string, usePropsCrops?: boolean) {
    artworkURL = artworkURL || this.state.artworkURL;

    let artworkBase64 = '';
    try {
      if (!isEmpty(artworkURL) && await window.electron.ipcRenderer.checkFileExists(artworkURL)) {
        artworkBase64 = await window.electron.ipcRenderer.createImgFromPath(artworkURL);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }

    const state: IArtworkEditDialogState = {
      loaded: true,
      artworkURL,
      artworkBase64,
      crop: usePropsCrops ? this.props.crop : {
        x: 0,
        y: 0,
        height: 100,
        width: 100,
        unit: '%'
      },
      keepRatio: this.props.keepRatio || false
    }

    if (this.state) {
      this.setState(state);
    } else {
      this.state = state;
    }
  }

  private onValidate(url: string, crop: Crop, keepRatio: boolean) {
    if (this.props.popupId) app.$popup.remove(this.props.popupId);
    if (this.props.resolve) this.props.resolve({ url, crop, keepRatio });
  }

  private onCroppingChange(crop: Crop) {
    if (this.state.keepRatio && crop.height !== crop.width) {
      if (crop.height !== this.state.crop.height) {
        crop.width = crop.height;
      }
      else if (crop.width !== this.state.crop.width) {
        crop.height = crop.width;
      }
    }
    this.setState({ crop });
  }

  public render() {
    if (!this.state?.loaded) return <Spinner />;
    return this.renderAttributes(<HorizontalStack gutter>
      <ArtworkCropping
        artworkBase64={this.state.artworkBase64}
        hasPendulumFrame={this.props.hasPendulumFrame}
        hasLinkFrame={this.props.hasLinkFrame}
        crop={this.state.crop}
        onCroppingChange={crop => this.onCroppingChange(crop)}
      />

      <ArtworkEditing
        artworkURL={this.state.artworkURL}
        artworkBase64={this.state.artworkBase64}
        keepRatio={this.state.keepRatio}
        pendulumRatio={this.props.pendulumRatio}
        hasPendulumFrame={this.props.hasPendulumFrame}
        hasLinkFrame={this.props.hasLinkFrame}
        isRush={this.props.isRush}
        crop={this.state.crop}
        onKeepRatioChange={keepRatio => this.setState({ keepRatio })}
        onCroppingChange={crop => this.setState({ crop })}
        onArtworkURLChange={url => app.$errorManager.handlePromise(this.loadArtworkBase64(url))}
        onValidate={(url, crop, keepRatio) => this.onValidate(url, crop, keepRatio)}
      />
    </HorizontalStack>, 'artwork-edit-dialog');
  }
}