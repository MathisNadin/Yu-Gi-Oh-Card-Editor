import { Component } from 'react';
import { IPopoverAction, IPopoverOptions } from './interfaces';

interface PopoverContentState {}

export class PopoverContent extends Component<IPopoverOptions, PopoverContentState> {
  public constructor(props: IPopoverOptions) {
    super(props);
  }

  public render() {
    const functionsDefined = !!this.props.actionRenderer && !!this.props.doProcessAction;
    return (
      <div className='actions'>
        {!!this.props.actions?.length &&
          this.props.actions.map((action: IPopoverAction, index: number, items: IPopoverAction[]) => {
            let last = items.length - 1 === index;
            return functionsDefined ? this.props.actionRenderer(action, this.props.doProcessAction, last) : null;
          })}
      </div>
    );
  }
}
