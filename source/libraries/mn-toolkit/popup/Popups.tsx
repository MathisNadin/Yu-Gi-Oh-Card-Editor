import { Component } from 'react';
import { classNames, logger } from 'mn-tools';
import { IPopupListener } from '.';

const log = logger('Popups');

interface IPopupsProps {}

interface IPopupsState {}

export class Popups extends Component<IPopupsProps, IPopupsState> implements Partial<IPopupListener> {
  public constructor(props: IPopupsProps) {
    super(props);
    this.state = {} as IPopupsState;
    app.$popup.addListener(this);
  }

  public popupsChanged() {
    log.debug('popupsChanged');
    this.forceUpdate();
  }

  public render() {
    const popups = app.$popup.popups;
    log.debug('render', popups.length);
    return <div className={classNames('mn-popups', { active: !!popups.length })}>{popups}</div>;
  }
}
