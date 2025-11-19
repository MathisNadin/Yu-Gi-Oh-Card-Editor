import ReactCrop, { Crop } from 'react-image-crop';
import { IContainerProps, IContainerState, Container, VerticalStack } from 'mn-toolkit';

interface IArtworkCroppingProps extends IContainerProps {
  artworkBase64: string;
  crop: Crop;
  onCroppingChange: (crop: Crop) => void | Promise<void>;
}

interface IArtworkCroppingState extends IContainerState {}

export class ArtworkCropping extends Container<IArtworkCroppingProps, IArtworkCroppingState> {
  private async onCroppingChange(crop: Crop) {
    crop.x = Math.round(crop.x * 100) / 100;
    crop.y = Math.round(crop.y * 100) / 100;
    crop.height = Math.round(crop.height * 100) / 100;
    crop.width = Math.round(crop.width * 100) / 100;
    await this.props.onCroppingChange(crop);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['artwork-cropping'] = true;
    return classes;
  }

  public override get children() {
    if (!this.props.artworkBase64) return null;
    return (
      <VerticalStack fill itemAlignment='center' verticalItemAlignment='top'>
        <ReactCrop
          crop={this.props.crop}
          onChange={(_cropPx: Crop, percentageCrop: Crop) =>
            app.$errorManager.handlePromise(this.onCroppingChange(percentageCrop))
          }
        >
          <img src={this.props.artworkBase64} alt='artwork' />
        </ReactCrop>
      </VerticalStack>
    );
  }
}
