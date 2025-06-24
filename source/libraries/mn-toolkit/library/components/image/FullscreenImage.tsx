import { IContainableProps, IContainableState, Containable } from '../containable';
import { HorizontalStack } from '../container';
import { Icon } from '../icon';
import { IImageProps, Image as ToolkitImage } from '../image';
import { Typography } from '../typography';

export interface IFullscreenImageProps extends IContainableProps {
  key?: string;
  type?: string;
  onRef?: (ref: FullscreenImage) => void;
  imgSrc: IImageProps['src'];
  imgAlt: IImageProps['alt'];
  imgHint?: IImageProps['hint'];
}

interface IFullscreenImageState extends IContainableState {
  visible: boolean;
}

export class FullscreenImage extends Containable<IFullscreenImageProps, IFullscreenImageState> {
  public static override get defaultProps(): Omit<IFullscreenImageProps, 'imgAlt' | 'imgSrc'> {
    return {
      ...super.defaultProps,
      bg: undefined,
      maxWidth: app.$device.isSmallScreen ? '95vw' : '90vw',
      minHeight: '50vh',
      maxHeight: '95vh',
      type: 'fullscreen-image',
    };
  }

  public constructor(props: IFullscreenImageProps) {
    super(props);
    this.state = {
      ...this.state,
      loaded: true,
      visible: false,
    };
  }

  public override componentDidMount() {
    super.componentDidMount();

    const makeVisible = () =>
      requestAnimationFrame(() => requestAnimationFrame(() => this.setState({ visible: true })));

    // Preload image to display it instantly at the right size
    if (this.props.imgSrc) {
      const img = new Image();
      img.onload = makeVisible;
      img.src = this.props.imgSrc;
    } else {
      makeVisible();
    }
  }

  public async close() {
    await app.$device.keyboardClose();
    app.$fullscreenImage.remove(this.props.id!);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-fullscreen-image'] = true;
    if (this.props.type) classes[this.props.type] = true;
    classes['visible'] = this.state.visible;
    return classes;
  }

  public override get children() {
    if (!this.state.loaded) return null;
    return (
      <Containable className='mn-fullscreen-image-inside'>
        <figure className='mn-fullscreen-image-content'>
          <HorizontalStack itemAlignment='right'>
            <Icon size={20} icon='toolkit-close' name='Fermer' onTap={() => this.close()} />
          </HorizontalStack>

          <ToolkitImage src={this.props.imgSrc} alt={this.props.imgAlt} />

          {!!this.props.imgSrc && !!this.props.imgHint && (
            <figcaption>
              <Typography italic variant='help' contentType='text' content={this.props.imgHint} />
            </figcaption>
          )}
        </figure>
      </Containable>
    );
  }
}
