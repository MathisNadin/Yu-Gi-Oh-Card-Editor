import { IContainableProps, Containable, IContainableState } from '../containable';

interface IImageProps extends IContainableProps<HTMLImageElement> {
  src: string | undefined;
  alt?: string;
  title?: string;
}

interface IImageState extends IContainableState {}

export class Image extends Containable<IImageProps, IImageState, HTMLImageElement> {
  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-image'] = true;
    return classes;
  }

  public override render() {
    return (
      <img
        {...this.renderAttributes()}
        ref={this.base}
        src={this.props.src}
        alt={this.props.alt}
        title={this.props.title}
      />
    );
  }
}
