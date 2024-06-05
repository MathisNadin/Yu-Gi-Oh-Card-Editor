import { isEmpty } from 'mn-tools';
import { Crop } from 'react-image-crop';
import { ArtworkCropping } from './ArtworkCropping';
import { ArtworkEditing } from './ArtworkEditing';
import { AbstractPopup, IAbstractPopupProps, IAbstractPopupState, HorizontalStack } from 'mn-toolkit';

export interface IArtworkEditDialogResult {
  url: string;
  crop: Crop;
  keepRatio: boolean;
}

interface IArtworkEditDialogProps extends IAbstractPopupProps<IArtworkEditDialogResult> {
  artworkURL: string;
  pendulumRatio: boolean;
  hasPendulumFrame: boolean;
  hasLinkFrame: boolean;
  isRush: boolean;
  crop: Crop;
  keepRatio: boolean;
}

interface IArtworkEditDialogState extends IAbstractPopupState {
  artworkURL: string;
  artworkBase64: string;
  crop: Crop;
  keepRatio: boolean;
}

export class ArtworkEditDialog extends AbstractPopup<
  IArtworkEditDialogResult,
  IArtworkEditDialogProps,
  IArtworkEditDialogState
> {
  public static async show(options: IArtworkEditDialogProps) {
    options.title = options.title || "Édition de l'image";
    options.height = options.height || '90%';
    options.width = options.width || '90%';
    return await app.$popup.show<IArtworkEditDialogResult, IArtworkEditDialogProps>({
      type: 'artwork-edit',
      Component: ArtworkEditDialog,
      componentProps: options,
    });
  }

  public constructor(props: IArtworkEditDialogProps) {
    super(props);
    this.state = {
      ...this.state,
      loaded: true,
      artworkURL: props.artworkURL,
      artworkBase64: '',
      crop: props.crop,
      keepRatio: props.keepRatio,
    };
  }

  public componentDidMount() {
    app.$errorManager.handlePromise(this.loadArtworkBase64(undefined, true));
  }

  public componentDidUpdate(prevProps: IArtworkEditDialogProps) {
    if (prevProps === this.props) return;
    app.$errorManager.handlePromise(this.loadArtworkBase64());
  }

  private async loadArtworkBase64(artworkURL?: string, usePropsCrops?: boolean) {
    artworkURL = artworkURL || this.state.artworkURL;

    let artworkBase64 = '';
    if (app.$device.isDesktop) {
      try {
        if (!isEmpty(artworkURL) && (await window.electron.ipcRenderer.checkFileExists(artworkURL))) {
          artworkBase64 = await window.electron.ipcRenderer.createImgFromPath(artworkURL);
        }
      } catch (error) {
        console.error(error);
      }
    }

    this.setState({
      loaded: true,
      artworkURL,
      artworkBase64,
      keepRatio: this.props.keepRatio || false,
      crop: usePropsCrops
        ? this.props.crop
        : {
            x: 0,
            y: 0,
            height: 100,
            width: 100,
            unit: '%',
          },
    });
  }

  private onCroppingChange(crop: Crop) {
    if (this.state.keepRatio && crop.height !== crop.width) {
      if (crop.height !== this.state.crop.height) {
        crop.width = crop.height;
      } else if (crop.width !== this.state.crop.width) {
        crop.height = crop.width;
      }
    }
    this.setState({ crop });
  }

  public renderContent() {
    return (
      <HorizontalStack className='artwork-edit-dialog' gutter>
        <ArtworkCropping
          artworkBase64={this.state.artworkBase64}
          hasPendulumFrame={this.props.hasPendulumFrame}
          hasLinkFrame={this.props.hasLinkFrame}
          crop={this.state.crop}
          onCroppingChange={(crop) => this.onCroppingChange(crop)}
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
          onKeepRatioChange={(keepRatio) => this.setState({ keepRatio })}
          onCroppingChange={(crop) => this.setState({ crop })}
          onArtworkURLChange={(url) => app.$errorManager.handlePromise(this.loadArtworkBase64(url))}
          onValidate={(url, crop, keepRatio) => this.close({ url, crop, keepRatio })}
        />
      </HorizontalStack>
    );
  }
}
