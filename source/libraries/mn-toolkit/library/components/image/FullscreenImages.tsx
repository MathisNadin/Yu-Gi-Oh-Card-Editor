import { logger } from 'mn-tools';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { IFullscreenImageListener } from '.';

const log = logger('FullscreenImages');

interface IFullscreenImagesProps extends IContainableProps {}

interface IFullscreenImagesState extends IContainableState {}

export class FullscreenImages
  extends Containable<IFullscreenImagesProps, IFullscreenImagesState>
  implements Partial<IFullscreenImageListener>
{
  public static override get defaultProps(): IFullscreenImagesProps {
    return {
      ...super.defaultProps,
      zIndex: 'fullscreen-image',
    };
  }

  public constructor(props: IFullscreenImagesProps) {
    super(props);
    app.$fullscreenImage.addListener(this);
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    app.$fullscreenImage.removeListener(this);
  }

  public fullscreenImagesChanged() {
    log.debug('fullscreenImagesChanged');
    this.forceUpdate();
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-fullscreen-images'] = true;
    classes['active'] = !!app.$fullscreenImage.fullscreenImages.length;
    return classes;
  }

  public override render() {
    log.debug('render', app.$fullscreenImage.fullscreenImages.length);
    return (
      <div ref={this.base} {...this.renderAttributes()}>
        <div className='overlay' onClick={() => app.$errorManager.handlePromise(app.$fullscreenImage.closeLast())} />
        {app.$fullscreenImage.fullscreenImages.map((p) => p.element)}
      </div>
    );
  }
}
