import { IContainableProps, Containable, IContainableState } from '../containable';

interface IImageProps extends IContainableProps {
  src: string;
  alt?: string;
  title?: string;
}

interface IImageState extends IContainableState {}

export class Image extends Containable<IImageProps, IImageState> {
  public static get defaultProps(): Partial<IImageProps> {
    return {
      ...super.defaultProps,
    };
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-image'] = true;
    return classes;
  }

  public render() {
    return <img {...this.renderAttributes()} src={this.props.src} alt={this.props.alt} title={this.props.title} />;
  }
}
