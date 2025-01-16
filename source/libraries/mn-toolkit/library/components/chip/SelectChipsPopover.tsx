import { classNames } from 'mn-tools';
import { IActionsPopoverProps, IActionsPopoverState, ActionsPopover, IActionsPopoverAction } from '../popover';
import { HorizontalStack } from '../container';
import { CheckBox } from '../checkbox';
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
      <HorizontalStack
        key={`action-${i}`}
        id={action.id ? `${action.id}` : undefined}
        bg={action.bg}
        disabled={action.disabled}
        verticalItemAlignment='middle'
        className={classNames('action', action.className, {
          selected: action.selected,
          title: action.isTitle,
        })}
        onTap={!action.onTap ? undefined : (event) => app.$errorManager.handlePromise(this.onTapAction(event, action))}
      >
        <CheckBox defaultValue={action.selected} />
        <Typography fill variant='document' contentType='text' content={action.label} />
      </HorizontalStack>
    );
  }

  protected override async onTapAction(event: React.MouseEvent<HTMLDivElement>, action: IActionsPopoverAction<ID>) {
    const actions = this.state.actions.map((a) => (a.id === action.id ? { ...a, selected: !a.selected } : a));
    await this.setStateAsync({ actions });
    if (action.onTap) await action.onTap(event);
  }
}
