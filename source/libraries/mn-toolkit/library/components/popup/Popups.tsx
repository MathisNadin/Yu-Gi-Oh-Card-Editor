import { logger } from 'mn-tools';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { IPopupListener } from '.';

const log = logger('Popups');

interface IPopupsProps extends IContainableProps {}

interface IPopupsState extends IContainableState {}

export class Popups extends Containable<IPopupsProps, IPopupsState> implements Partial<IPopupListener> {
  public static override get defaultProps(): IPopupsProps {
    return {
      ...super.defaultProps,
      zIndex: 'popup',
    };
  }

  public constructor(props: IPopupsProps) {
    super(props);
    app.$popup.addListener(this);
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    app.$popup.removeListener(this);
  }

  public popupsChanged() {
    log.debug('popupsChanged');
    this.forceUpdate();
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-popups'] = true;
    classes['active'] = !!app.$popup.popups.length;
    return classes;
  }

  public override render() {
    log.debug('render', app.$popup.popups.length);
    return (
      <div ref={this.base} {...this.renderAttributes()}>
        {app.$popup.popups.map((p) => p.element)}
      </div>
    );
  }
}
