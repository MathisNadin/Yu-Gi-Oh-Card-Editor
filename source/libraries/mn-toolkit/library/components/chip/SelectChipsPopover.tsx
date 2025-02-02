import { classNames } from 'mn-tools';
import { IActionsPopoverProps, IActionsPopoverState, ActionsPopover, IActionsPopoverAction } from '../popover';
import { Checkbox } from '../checkbox';
import { Typography } from '../typography';

export interface ISelectChipsPopoverProps<ID = number> extends IActionsPopoverProps<ID> {}

interface ISelectChipsPopoverState<ID = number> extends IActionsPopoverState<ID> {}

export class SelectChipsPopover<ID = number> extends ActionsPopover<
  ID,
  ISelectChipsPopoverProps<ID>,
  ISelectChipsPopoverState<ID>
> {
  protected override renderAction(action: IActionsPopoverAction<ID>, i: number) {
    return (
      <li
        key={`action-${i}`}
        id={action.id ? `${action.id}` : undefined}
        className={classNames(this.renderActionClasses(action))}
        onClick={(event) => !!action.onTap && app.$errorManager.handlePromise(this.onTapAction(event, action))}
      >
        <Checkbox defaultValue={action.selected} />
        <Typography fill bold={action.isTitle} variant='document' contentType='text' content={action.label} />
      </li>
    );
  }

  protected override async onTapAction(event: React.MouseEvent<HTMLLIElement>, action: IActionsPopoverAction<ID>) {
    const actions = this.state.actions.map((a) => (a.id === action.id ? { ...a, selected: !a.selected } : a));
    await this.setStateAsync({ actions });
    if (action.onTap) await action.onTap(event);
  }
}
