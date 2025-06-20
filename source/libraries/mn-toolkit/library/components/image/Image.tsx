import { SyntheticEvent } from 'react';
import { IContainableProps, Containable, IContainableState } from '../containable';

export interface IImageProps extends IContainableProps<HTMLImageElement> {
  src: string | undefined;
  alt: string;
  fullscreenSrc?: string;

  // Image Events
  onAbort?: (event: SyntheticEvent<HTMLImageElement, Event>) => void;
  onAbortCapture?: (event: SyntheticEvent<HTMLImageElement, Event>) => void;
  onError?: (event: SyntheticEvent<HTMLImageElement, Event>) => void;
  onErrorCapture?: (event: SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoadStart?: (event: SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoadStartCapture?: (event: SyntheticEvent<HTMLImageElement, Event>) => void;
  onProgress?: (event: SyntheticEvent<HTMLImageElement, Event>) => void;
  onProgressCapture?: (event: SyntheticEvent<HTMLImageElement, Event>) => void;
  onSuspend?: (event: SyntheticEvent<HTMLImageElement, Event>) => void;
  onSuspendCapture?: (event: SyntheticEvent<HTMLImageElement, Event>) => void;
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

    // Image Events
    attributes.onAbort = this.props.onAbort;
    attributes.onAbortCapture = this.props.onAbortCapture;
    attributes.onError = this.props.onError;
    attributes.onErrorCapture = this.props.onErrorCapture;
    attributes.onLoadStart = this.props.onLoadStart;
    attributes.onLoadStartCapture = this.props.onLoadStartCapture;
    attributes.onProgress = this.props.onProgress;
    attributes.onProgressCapture = this.props.onProgressCapture;
    attributes.onSuspend = this.props.onSuspend;
    attributes.onSuspendCapture = this.props.onSuspendCapture;

    return attributes;
  }

  public override render() {
    return <img ref={this.base} {...this.renderAttributes()} src={this.props.src || undefined} alt={this.props.alt} />;
  }
}
