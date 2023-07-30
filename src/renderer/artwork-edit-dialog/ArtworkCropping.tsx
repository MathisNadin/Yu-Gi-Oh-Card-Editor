/* eslint-disable no-undef */
/* eslint-disable prefer-const */
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
import { Container } from 'mn-toolkit/container/Container';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/src/ReactCrop.scss'
import './styles.css';
import { Spinner } from 'mn-toolkit/spinner/Spinner';

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
      loaded: false,
      higher: false,
      croppedArtworkBase64: '',
      crop: props.crop
    }
    this.loadHigher(props);
  }

  public componentWillReceiveProps(nextProps: IArtworkCroppingProps, _prevState: IArtworkCroppingState) {
    this.loadHigher(nextProps);
  }

  private loadHigher(props: IArtworkCroppingProps) {
    if (!props.artworkBase64) {
      this.setState({
        loaded: true,
        higher: false,
        crop: props.crop
      });
    } else {
      const image = new Image();
      image.src = props.artworkBase64;
      image.onload = () => this.setState({
        loaded: true,
        higher: image.height > image.width,
        crop: props.crop
      })
    }
  }

  private onCroppingChange(crop: Crop) {
    crop.x = Math.round(crop.x * 100) / 100;
    crop.y = Math.round(crop.y * 100) / 100;
    crop.height = Math.round(crop.height * 100) / 100;
    crop.width = Math.round(crop.width * 100) / 100;
    this.setState({ crop });
    if (this.props.onCroppingChange) this.props.onCroppingChange(crop);
  }

  public render() {
    if (!this.state?.loaded) return <Spinner />;
    return this.renderAttributes(<Container>
      {!!this.props.artworkBase64.length && <ReactCrop
        className={`cropping-interface ${this.state.higher ? 'higher' : ''}`}
        crop={this.state.crop}
        onChange={(_cropPx: Crop, crop: Crop) => this.onCroppingChange(crop)}>

        <img id='artwork-img' className='artwork-img' src={this.props.artworkBase64} alt='artwork' />
      </ReactCrop>}
    </Container>, 'artwork-cropping');
  }
}
