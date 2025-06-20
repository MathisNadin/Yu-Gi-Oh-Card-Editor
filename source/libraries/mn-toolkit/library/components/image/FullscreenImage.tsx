import { IContainerProps, IContainerState, Container, HorizontalStack } from '../container';
import { Icon } from '../icon';
import { IImageProps, Image as ToolkitImage } from '../image';
import { Spacer } from '../spacer';
import { Typography } from '../typography';

export interface IFullscreenImageProps extends IContainerProps {
  key?: string;
  type?: string;
  onRef?: (ref: FullscreenImage) => void;
  imgSrc: IImageProps['src'];
  imgAlt: IImageProps['alt'];
  imgHint?: IImageProps['hint'];
}

interface IFullscreenImageState extends IContainerState {
  visible: boolean;
}

export class FullscreenImage extends Container<IFullscreenImageProps, IFullscreenImageState> {
  public static override get defaultProps(): Omit<IFullscreenImageProps, 'imgAlt' | 'imgSrc'> {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      gutter: true,
      padding: true,
      bg: undefined,
      maxWidth: app.$device.isSmallScreen ? '95%' : '90%',
      minHeight: '50%',
      maxHeight: '95%',
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

  public close() {
    app.$device.keyboardClose();
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
    return [this.state.loaded && this.renderHeader(), this.state.loaded && this.renderContent()];
  }

  protected renderHeader() {
    return (
      <HorizontalStack key='header' className='mn-fullscreen-image-header'>
        <Spacer />
        <Icon icon='toolkit-close' name='Fermer' onTap={() => this.close()} />
      </HorizontalStack>
    );
  }

  public renderContent() {
    if (!this.props.imgSrc) return null;
    return (
      <figure key='content' className='mn-fullscreen-image-content'>
        <ToolkitImage src={this.props.imgSrc} alt={this.props.imgAlt} maxHeight={this.imgMaxHeight} />

        {!!this.props.imgHint && (
          <figcaption>
            <Typography italic variant='help' contentType='text' content={this.props.imgHint} />
          </figcaption>
        )}
      </figure>
    );
  }

  private get imgMaxHeight() {
    if (app.$device.isSmallScreen) return app.$device.screenHeight * 0.9;
    return app.$device.screenHeight * 0.85;
  }
}
