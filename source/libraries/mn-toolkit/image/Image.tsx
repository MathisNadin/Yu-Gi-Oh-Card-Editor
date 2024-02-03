import { IContainableProps, Containable, IContainableState } from "../containable";

interface IImageProps extends IContainableProps {
  src: string;
  alt?: string;
  title?: string;
}

interface IImageState extends IContainableState { }

export class Image extends Containable<IImageProps, IImageState> {

  public static get defaultProps(): Partial<IImageProps> {
    return {
      ...super.defaultProps,
    };
  }

  public constructor(props: IImageProps) {
    super(props);
  }

  public render() {
    return this.renderAttributes(<img src={this.props.src} alt={this.props.alt} title={this.props.title} />, "mn-image");
  }

}
