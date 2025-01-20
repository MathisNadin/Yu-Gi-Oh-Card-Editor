import { logger } from 'mn-tools';
import { IContainableProps, IContainableState, Containable } from '../containable';
import { IPopoverListener } from '.';

const log = logger('Popovers');

interface IPopoversProps extends IContainableProps {}

interface IPopoversState extends IContainableState {}

export class Popovers extends Containable<IPopoversProps, IPopoversState> implements Partial<IPopoverListener> {
  public static override get defaultProps(): IPopoversProps {
    return {
      ...super.defaultProps,
      zIndex: 'popover',
    };
  }

  public constructor(props: IPopoversProps) {
    super(props);
    this.state = {} as IPopoversState;
    app.$popover.addListener(this);
  }

  public popoversChanged() {
    log.debug('popoversChanged');
    this.forceUpdate();
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-popovers'] = true;
    return classes;
  }

  public override render() {
    const { hasOverlay, popovers, focuses } = app.$popover;
    const focusSpace = (app.$theme.settings.commons?.['default-spacing']?.value || 16) / 4;
    log.debug('render', popovers.length, focuses.length);
    return (
      <div ref={this.base} {...this.renderAttributes()}>
        {hasOverlay && <div className='mn-popover-overlay' />}
        {popovers.map((p) => p.element)}
        {focuses.map((f, i) => (
          <div
            key={`focus-${i}`}
            className='mn-popover-focus'
            style={{
              top: f.targetRectangle.top - focusSpace,
              left: f.targetRectangle.left - focusSpace,
              width: f.targetRectangle.width + focusSpace * 2,
              height: f.targetRectangle.height + focusSpace * 2,
            }}
          />
        ))}
      </div>
    );
  }
}
