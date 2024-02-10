// eslint-disable-next-line import/no-named-as-default
import ReactCrop, { Crop } from 'react-image-crop';
import { classNames, isDefined } from 'libraries/mn-tools';
import { IContainableProps, IContainableState, Containable, Spinner, Container } from 'libraries/mn-toolkit';

interface IArtworkCroppingProps extends IContainableProps {
  artworkBase64: string;
  hasPendulumFrame: boolean;
  hasLinkFrame: boolean;
  crop: Crop;
  onCroppingChange: (crop: Crop) => void;
}

interface IArtworkCroppingState extends IContainableState {
  higher: boolean;
  crop: Crop;
  croppedArtworkBase64: string;
}

export class ArtworkCropping extends Containable<IArtworkCroppingProps, IArtworkCroppingState> {
  public constructor(props: IArtworkCroppingProps) {
    super(props);
    this.state = {
      ...this.state,
      loaded: false,
      croppedArtworkBase64: '',
      crop: props.crop,
    };
  }

  public componentDidMount() {
    this.loadHigher();
  }

  public componentDidUpdate(prevProps: IArtworkCroppingProps) {
    if (isDefined(this.state.higher) && prevProps !== this.props) {
      this.loadHigher();
    }
  }

  private loadHigher() {
    if (!this.props.artworkBase64) {
      this.setState({
        loaded: true,
        higher: false,
        crop: this.props.crop,
      });
    } else {
      const container = document.querySelector('.artwork-cropping') as HTMLElement;
      if (!container) return;
      const containerisHigher = container.clientHeight > container.clientWidth;

      const image = new Image();
      image.src = this.props.artworkBase64;
      const imageIsHigher = image.height > image.width;

      image.onload = () =>
        this.setState({
          loaded: true,
          higher: containerisHigher && imageIsHigher,
          crop: this.props.crop,
        });
    }
  }

  private onCroppingChange(crop: Crop) {
    crop.x = Math.round(crop.x * 100) / 100;
    crop.y = Math.round(crop.y * 100) / 100;
    crop.height = Math.round(crop.height * 100) / 100;
    crop.width = Math.round(crop.width * 100) / 100;
    this.setState({ crop }, () => !!this.props.onCroppingChange && this.props.onCroppingChange(this.state.crop));
  }

  public render() {
    if (!this.state.loaded) return <Spinner />;
    return this.renderAttributes(
      <Container margin>
        {!!this.props.artworkBase64.length && (
          <ReactCrop
            className={classNames('cropping-interface', { higher: this.state.higher, larger: !this.state.higher })}
            crop={this.state.crop}
            onChange={(_cropPx: Crop, crop: Crop) => this.onCroppingChange(crop)}
          >
            <img id='artwork-img' className='artwork-img' src={this.props.artworkBase64} alt='artwork' />
          </ReactCrop>
        )}
      </Container>,
      'artwork-cropping'
    );
  }
}
