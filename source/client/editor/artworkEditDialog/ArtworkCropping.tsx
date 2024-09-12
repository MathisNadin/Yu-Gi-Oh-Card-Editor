// eslint-disable-next-line import/no-named-as-default
import ReactCrop, { Crop } from 'react-image-crop';
import { classNames, isUndefined } from 'mn-tools';
import { IContainableProps, IContainableState, Containable, Spinner, HorizontalStack } from 'mn-toolkit';
import { createRef } from 'react';

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
  artworkBase64: string;
}

export class ArtworkCropping extends Containable<IArtworkCroppingProps, IArtworkCroppingState> {
  private croppingRef = createRef<HorizontalStack>();

  public constructor(props: IArtworkCroppingProps) {
    super(props);
    this.state = {
      ...this.state,
      loaded: false,
      crop: props.crop,
      artworkBase64: '',
    };
  }

  public componentDidMount() {
    requestAnimationFrame(() => requestAnimationFrame(() => this.loadHigher()));
  }

  private prevPropsIsDifferent(prevProps: IArtworkCroppingProps) {
    return (
      prevProps.hasPendulumFrame !== this.props.hasPendulumFrame ||
      prevProps.hasLinkFrame !== this.props.hasLinkFrame ||
      prevProps.crop.height !== this.props.crop.height ||
      prevProps.crop.width !== this.props.crop.width ||
      prevProps.crop.x !== this.props.crop.x ||
      prevProps.crop.y !== this.props.crop.y ||
      prevProps.artworkBase64 !== this.props.artworkBase64
    );
  }

  public componentDidUpdate(prevProps: IArtworkCroppingProps) {
    if (isUndefined(this.state.higher) || !this.prevPropsIsDifferent(prevProps)) return;
    requestAnimationFrame(() => requestAnimationFrame(() => this.loadHigher()));
  }

  private loadHigher() {
    if (!this.props.artworkBase64 || !this.croppingRef.current?.base?.current) {
      return this.setState({
        loaded: true,
        higher: false,
        crop: this.props.crop,
        artworkBase64: '',
      });
    }

    const container = this.croppingRef.current.base.current;
    const containerisHigher = container.clientHeight > container.clientWidth;

    const image = new Image();
    image.src = this.props.artworkBase64;
    const imageIsHigher = image.height > image.width;

    image.onload = () =>
      this.setState({
        loaded: true,
        higher: containerisHigher && imageIsHigher,
        crop: this.props.crop,
        artworkBase64: this.props.artworkBase64,
      });
  }

  private onCroppingChange(crop: Crop) {
    crop.x = Math.round(crop.x * 100) / 100;
    crop.y = Math.round(crop.y * 100) / 100;
    crop.height = Math.round(crop.height * 100) / 100;
    crop.width = Math.round(crop.width * 100) / 100;
    this.setState({ crop }, () => this.props.onCroppingChange(this.state.crop));
  }

  public render() {
    if (!this.state.loaded) return <Spinner />;
    return (
      <HorizontalStack ref={this.croppingRef} className='artwork-cropping' margin>
        {!!this.state.artworkBase64 && (
          <ReactCrop
            className={classNames('cropping-interface', { higher: this.state.higher, larger: !this.state.higher })}
            crop={this.state.crop}
            onChange={(_cropPx: Crop, crop: Crop) => this.onCroppingChange(crop)}
          >
            <img id='artwork-img' className='artwork-img' src={this.state.artworkBase64} alt='artwork' />
          </ReactCrop>
        )}
      </HorizontalStack>
    );
  }
}
