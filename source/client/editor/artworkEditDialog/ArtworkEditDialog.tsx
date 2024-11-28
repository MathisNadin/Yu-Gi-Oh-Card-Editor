import { isDefined, isEmpty } from 'mn-tools';
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
    options.title = options.title || "Modifier l'artwork";
    options.height = options.height || '95%';
    options.width = options.width || '85%';
    return await app.$popup.show<IArtworkEditDialogResult, IArtworkEditDialogProps>({
      type: 'artwork-edit',
      Component: ArtworkEditDialog,
      componentProps: options,
    });
  }

  public async onInitializePopup() {
    this.state.buttons.push({
      color: 'positive',
      label: 'Valider',
      onTap: () =>
        this.close({
          url: this.state.artworkURL,
          crop: this.state.crop,
          keepRatio: this.state.keepRatio,
        }),
    });
    await this.loadArtworkBase64(this.props.artworkURL, this.props.crop);
  }

  private async loadArtworkBase64(artworkURL: string, crop?: Crop) {
    let artworkBase64 = '';
    if (app.$device.isElectron(window)) {
      try {
        if (!isEmpty(artworkURL) && (await window.electron.ipcRenderer.invoke('checkFileExists', artworkURL))) {
          const base64 = await window.electron.ipcRenderer.invoke('createImgFromPath', artworkURL);
          if (isDefined(base64)) artworkBase64 = base64;
        }
      } catch (error) {
        console.error(error);
      }
    }

    await this.setStateAsync({
      artworkURL,
      artworkBase64,
      keepRatio: this.props.keepRatio || false,
      crop: crop || {
        x: 0,
        y: 0,
        height: 100,
        width: 100,
        unit: '%',
      },
    });
  }

  private async onCroppingChange(crop: Crop) {
    if (this.state.keepRatio && crop.height !== crop.width) {
      if (crop.height !== this.state.crop.height) {
        crop.width = crop.height;
      } else if (crop.width !== this.state.crop.width) {
        crop.height = crop.width;
      }
    }
    await this.setStateAsync({ crop });
  }

  protected override get scrollInContent() {
    return true;
  }

  public override renderContent() {
    return (
      <HorizontalStack className='artwork-edit-dialog' gutter>
        <ArtworkCropping
          fill
          margin
          artworkBase64={this.state.artworkBase64}
          crop={this.state.crop}
          onCroppingChange={(crop) => this.onCroppingChange(crop)}
        />

        <ArtworkEditing
          fill
          artworkURL={this.state.artworkURL}
          artworkBase64={this.state.artworkBase64}
          keepRatio={this.state.keepRatio}
          pendulumRatio={this.props.pendulumRatio}
          hasPendulumFrame={this.props.hasPendulumFrame}
          hasLinkFrame={this.props.hasLinkFrame}
          isRush={this.props.isRush}
          crop={this.state.crop}
          onKeepRatioChange={(keepRatio) => this.setStateAsync({ keepRatio })}
          onCroppingChange={(crop) => this.setStateAsync({ crop })}
          onArtworkURLChange={(url) => this.loadArtworkBase64(url)}
        />
      </HorizontalStack>
    );
  }
}
