import { IContainableProps, Containable, IContainableState } from '../containable';

export interface IImageProps extends IContainableProps<HTMLImageElement> {
  src: string | undefined;
  alt: string;
  fullscreenSrc?: string;
}

interface IImageState extends IContainableState {}

export class Image extends Containable<IImageProps, IImageState, HTMLImageElement> {
  private get hasClick() {
    return !!this.props.onTap || !!this.props.fullscreenSrc;
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-image'] = true;
    classes['has-click'] = this.hasClick;
    return classes;
  }

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    if (this.hasClick) {
      attributes.onClick = (e) => {
        if (this.props.fullscreenSrc) {
          app.$fullscreenImage.image({
            imgSrc: this.props.fullscreenSrc,
            imgAlt: this.props.alt,
            imgHint: this.props.hint,
          });
        }
        if (this.props.onTap) app.$errorManager.handlePromise(this.props.onTap(e));
      };
    } else {
      delete attributes.onClick;
    }
    return attributes;
  }

  public override render() {
    return <img ref={this.base} {...this.renderAttributes()} src={this.props.src} alt={this.props.alt} />;
  }
}
