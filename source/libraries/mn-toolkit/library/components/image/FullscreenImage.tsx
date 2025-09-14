import { createRef } from 'react';
import { IContainableProps, IContainableState, Containable } from '../containable';
import { HorizontalStack, VerticalStack } from '../container';
import { Icon } from '../icon';
import { IImageProps, Image as ToolkitImage } from '../image';
import { Spinner } from '../spinner';
import { Typography } from '../typography';

export interface IFullscreenImageProps extends IContainableProps {
  key?: string;
  type?: string;
  onRef?: (ref: FullscreenImage) => void;
  imgSrc: IImageProps['src'];
  imgAlt: IImageProps['alt'];
  imgHint?: IImageProps['hint'];
}

export interface IFullscreenImageState extends IContainableState {
  visible: boolean;
  showSpinner: boolean;
}

export class FullscreenImage extends Containable<IFullscreenImageProps, IFullscreenImageState> {
  protected spinnerTimeout?: NodeJS.Timeout;
  private figureRef = createRef<HTMLElement>();

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
      showSpinner: false,
    };
  }

  public override componentDidMount() {
    super.componentDidMount();

    // Timer to display the spinner after 200ms if the image is not yet visible
    this.spinnerTimeout = setTimeout(() => {
      if (!this.state.visible) {
        this.setState({ showSpinner: true });
      }
    }, 200);

    const makeVisible = () => {
      // The spinner timer is cleared if the image is loaded before 200ms
      if (this.spinnerTimeout) {
        clearTimeout(this.spinnerTimeout);
        this.spinnerTimeout = undefined;
      }
      this.setState({ visible: true, showSpinner: false });
    };

    // Preload image to display it instantly at the right size
    if (this.props.imgSrc) {
      const img = new window.Image();
      img.onload = makeVisible;
      img.src = this.props.imgSrc;
    } else {
      makeVisible();
    }
  }

  public override componentWillUnmount() {
    super.componentWillUnmount?.();
    if (this.spinnerTimeout) {
      clearTimeout(this.spinnerTimeout);
      this.spinnerTimeout = undefined;
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
      <VerticalStack
        className='mn-fullscreen-image-inside'
        gutter='small'
        padding
        itemAlignment='center'
        onTap={async (e) => {
          // Only close if the click target is not inside the figure
          if (this.figureRef.current && !this.figureRef.current.contains(e.target as Node)) {
            await this.close();
          }
        }}
      >
        {this.state.showSpinner && <Spinner />}

        <figure className='mn-fullscreen-image-content' ref={this.figureRef}>
          <HorizontalStack itemAlignment='right'>
            <Icon size={24} icon='toolkit-close' name='Fermer' onTap={() => this.close()} />
          </HorizontalStack>

          <ToolkitImage src={this.props.imgSrc} alt={this.props.imgAlt} />

          {!!this.props.imgSrc && !!this.props.imgHint && (
            <figcaption>
              <Typography
                theme='dark'
                bold
                fontSize='small'
                variant='help'
                contentType='text'
                content={this.props.imgHint}
              />
            </figcaption>
          )}
        </figure>
      </VerticalStack>
    );
  }
}
