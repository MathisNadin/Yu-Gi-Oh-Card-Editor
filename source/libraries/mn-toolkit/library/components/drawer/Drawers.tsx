import { logger } from 'mn-tools';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { IDrawerListener } from '.';

const log = logger('Drawers');

interface IDrawersProps extends IContainableProps {}

interface IDrawersState extends IContainableState {}

export class Drawers extends Containable<IDrawersProps, IDrawersState> implements Partial<IDrawerListener> {
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

  public override render() {
    log.debug('render', app.$drawer.drawers.length);
    return (
      <div ref={this.base} {...this.renderAttributes()}>
        <div className='overlay' onClick={() => app.$drawer.closeLast()} />
        {app.$drawer.drawers.map((p) => p.element)}
      </div>
    );
  }
}
