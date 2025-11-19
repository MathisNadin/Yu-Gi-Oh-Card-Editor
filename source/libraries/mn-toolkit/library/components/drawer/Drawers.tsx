import { logger } from 'mn-tools';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { TDrawerOrientation } from './Drawer';
import { IDrawerListener } from '.';

const log = logger('Drawers');

interface IDrawersProps extends IContainableProps {}

interface IDrawersState extends IContainableState {}

export class Drawers extends Containable<IDrawersProps, IDrawersState> implements Partial<IDrawerListener> {
  private touchStartX = 0;
  private touchStartY = 0;

  public static override get defaultProps(): IDrawersProps {
    return {
      ...super.defaultProps,
      zIndex: 'drawer',
    };
  }

  public constructor(props: IDrawersProps) {
    super(props);
    app.$drawer.addListener(this);
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    app.$drawer.removeListener(this);
  }

  public drawersChanged() {
    log.debug('drawersChanged');
    this.forceUpdate();
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-drawers'] = true;
    classes['active'] = !!app.$drawer.drawers.length;
    return classes;
  }

  private onTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0];
    if (!touch) return;
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  private onTouchEnd(e: React.TouchEvent<HTMLDivElement>, topOrientation: TDrawerOrientation) {
    const touch = e.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const threshold = 30; // minimum in pixel to consider this a swipe

    let direction: TDrawerOrientation | undefined;
    if (absX > absY && absX > threshold) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else if (absY > absX && absY > threshold) {
      direction = deltaY > 0 ? 'bottom' : 'top';
    }

    if (!direction || direction !== topOrientation) return;
    log.debug(`Swipe detected : ${direction}`);
    app.$errorManager.handlePromise(app.$drawer.closeLast());
  }

  public override render() {
    log.debug('render', app.$drawer.drawers.length);
    const topOrientation = app.$drawer.drawers.at(-1)?.orientation;
    return (
      <div
        ref={this.base}
        {...this.renderAttributes()}
        onTouchStart={topOrientation ? (e) => this.onTouchStart(e) : undefined}
        onTouchEnd={topOrientation ? (e) => this.onTouchEnd(e, topOrientation) : undefined}
      >
        <div className='overlay' onClick={() => app.$errorManager.handlePromise(app.$drawer.closeLast())} />
        {app.$drawer.drawers.map((p) => p.element)}
      </div>
    );
  }
}
