import { Component } from 'react';
import { logger } from 'mn-tools';
import { IPopoverListener } from '.';

const log = logger('Popovers');

interface IPopoversProps {}

interface IPopoversState {}

export class Popovers extends Component<IPopoversProps, IPopoversState> implements Partial<IPopoverListener> {
  public constructor(props: IPopoversProps) {
    super(props);
    this.state = {} as IPopoversState;
    app.$popover.addListener(this);
  }

  public popoversChanged() {
    log.debug('popoversChanged');
    this.forceUpdate();
  }

  public render() {
    const popovers = app.$popover.popovers;
    log.debug('render', popovers.length);
    return <div className='mn-popovers'>{popovers}</div>;
  }
}
