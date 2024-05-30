import { Component } from 'react';
import { logger } from 'mn-tools';
import { IToasterListener } from '.';

const log = logger('Toasters');

interface IToastersProps {}

interface IToastersState {}

export class Toasters extends Component<IToastersProps, IToastersState> implements Partial<IToasterListener> {
  public constructor(props: IToastersProps) {
    super(props);
    this.state = {} as IToastersState;
    app.$toaster.addListener(this);
  }

  public toastersChanged() {
    log.debug('toastersChanged');
    this.forceUpdate();
  }

  public render() {
    const toasters = app.$toaster.toasters;
    log.debug('render', toasters.length);
    return <div className='mn-toasters'>{toasters}</div>;
  }
}
