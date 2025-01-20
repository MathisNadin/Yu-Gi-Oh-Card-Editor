import { logger } from 'mn-tools';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { IToasterListener } from '.';

const log = logger('Toasters');

interface IToastersProps extends IContainableProps {}

interface IToastersState extends IContainableState {}

export class Toasters extends Containable<IToastersProps, IToastersState> implements Partial<IToasterListener> {
  public static override get defaultProps(): IToastersProps {
    return {
      ...super.defaultProps,
      zIndex: 'toaster',
    };
  }

  public constructor(props: IToastersProps) {
    super(props);
    app.$toaster.addListener(this);
  }

  public toastersChanged() {
    log.debug('toastersChanged');
    this.forceUpdate();
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-toasters'] = true;
    return classes;
  }

  public override render() {
    log.debug('render', app.$toaster.toasters.length);
    return (
      <div ref={this.base} {...this.renderAttributes()}>
        {app.$toaster.toasters}
      </div>
    );
  }
}
