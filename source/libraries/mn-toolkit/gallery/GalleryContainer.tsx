import { createRef } from 'react';
import { classNames } from 'mn-tools';
import { Icon } from '../icon';
import { VerticalStack, Container, IContainerProps, IContainerState } from '../container';
import { Spacer } from '../spacer';
import { Toolbar } from '../toolbar';

interface IGalleryContainerProps extends IContainerProps {}
interface IGalleryImage {
  index: number;
  src: string;
  width: number;
  height: number;
}

interface IGalleryContainerState extends IContainerState {
  images: IGalleryImage[];
  current: number;
  containerSize: { width: number; height: number };
}

export class GalleryContainer extends Container<IGalleryContainerProps, IGalleryContainerState> {
  private container = createRef<Container<IContainerProps, IContainerState>>();

  public static get defaultProps() {
    return {
      ...super.defaultProps,
    };
  }

  public constructor(props: IGalleryContainerProps) {
    super(props);
    this.state = { ...this.state, images: [], current: 0 };
  }

  public override componentDidMount() {
    super.componentDidMount();
    setTimeout(() => {
      if (!this.container?.current?.base?.current) return;
      const containerSize = this.container.current.base.current.getBoundingClientRect();
      this.setState({ containerSize });
    });
  }

  public setImages(images: string[]) {
    app.$errorManager.handlePromise(this._setImages(images));
  }

  private async _setImages(images: string[]) {
    let _images: IGalleryImage[] = [];
    let index = 0;
    for (let image of images) {
      _images.push(
        await new Promise((resolve) => {
          let img = new Image();
          img.onload = () => {
            resolve({ src: image, width: img.width, height: img.height, index });
          };
          img.src = image;
        })
      );
    }
    await this.setStateAsync({ images: _images, current: 0 });
  }

  public render() {
    if (!this.state.images.length) return <div />;

    let imageSize!: { height: number; width: number };
    let imagePosition!: { left: number; top: number };
    let image!: IGalleryImage;

    if (this.state.containerSize) {
      image = this.state.images[this.state.current];
      const testHeight = (image.height * this.state.containerSize.width) / image.width;
      if (image.width > image.height && testHeight <= this.state.containerSize.height) {
        imageSize = {
          width: this.state.containerSize.width,
          height: testHeight,
        };
      } else {
        imageSize = {
          height: this.state.containerSize.height,
          width: (image.width * this.state.containerSize.height) / image.height,
        };
      }
      imagePosition = {
        left: (this.state.containerSize.width - imageSize.width) / 2,
        top: (this.state.containerSize.height - imageSize.height) / 2,
      };
    }

    const multiple = this.state.images.length > 1;
    const leftDisabled = this.state.current === 0;
    const rightDisabled = this.state.current === this.state.images.length - 1;

    return (
      <VerticalStack className='mn-gallery mn-dark-theme'>
        <Toolbar>
          <Spacer />
          <Icon className='close' icon='toolkit-close' onTap={() => this.onClose()} />
        </Toolbar>

        <Container fill ref={this.container} verticalItemAlignment='middle' itemAlignment='center'>
          {multiple && (
            <Icon
              disabled={leftDisabled}
              floatPosition='middle-left'
              icon='toolkit-angle-left'
              className='left'
              onTap={() => this.onGoLeft()}
            />
          )}

          {multiple && (
            <Icon
              disabled={rightDisabled}
              floatPosition='middle-right'
              icon='toolkit-angle-right'
              className='right'
              onTap={() => this.onGoRight()}
            />
          )}

          {!!image && (
            <img
              alt='gallery'
              style={{ ...imageSize, ...imagePosition }}
              className={classNames('image', { selected: this.state.current === image.index })}
              src={image.src}
            />
          )}
        </Container>
      </VerticalStack>
    );
  }

  private async onClose() {
    await this.setStateAsync({ images: [] });
  }

  private async onGoRight() {
    let current = this.state.current + 1;
    if (current === this.state.images.length) current = 0;
    await this.setStateAsync({ current });
  }

  private async onGoLeft() {
    let current = this.state.current - 1;
    if (current === -1) current = this.state.images.length - 1;
    await this.setStateAsync({ current });
  }
}
