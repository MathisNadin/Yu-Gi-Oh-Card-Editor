import { Component } from 'react';
import { logger } from 'mn-tools';
import { themeSettings } from '../themeSettings';
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
    const { hasOverlay, popovers, focuses } = app.$popover;
    const focusSpace = themeSettings().themeDefaultSpacing / 4;
    log.debug('render', popovers.length, focuses.length);
    return (
      <div className='mn-popovers'>
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
