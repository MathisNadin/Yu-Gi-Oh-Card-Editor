import { isString } from 'mn-tools';
import { TJSXElementChild } from '../../system';
import { Sortable } from '../sortable';
import { Typography } from '../typography';
import { IAbstractPopupProps, IAbstractPopupState, AbstractPopup } from './AbstractPopup';

export interface ISortableDialogItem<ID = string> {
  id: ID;
  content: string | TJSXElementChild;
}

export interface ISortableDialogProps<ID = string> extends IAbstractPopupProps<ID[]> {
  items: ISortableDialogItem<ID>[];
}

interface ISortableDialogState<ID = string> extends IAbstractPopupState {
  items: ISortableDialogItem<ID>[];
}

export class SortableDialog<ID = string> extends AbstractPopup<
  ID[],
  ISortableDialogProps<ID>,
  ISortableDialogState<ID>
> {
  public static override get defaultProps(): ISortableDialogProps<string> {
    return {
      ...super.defaultProps,
      items: [],
    };
  }

  protected override async onInitializePopup() {
    const buttons = this.state.buttons;
    buttons.push({
      label: 'Annuler',
      color: 'neutral',
      onTap: () => this.close(),
    });
    buttons.push({
      label: 'Valider',
      color: 'primary',
      onTap: async () => await this.close(this.state.items.map((i) => i.id)),
    });

    await this.setStateAsync({ buttons, items: this.props.items });
  }

  public override renderContent() {
    return [
      <Sortable key='sortable' padding onSort={(from, to, before) => this.onSortItems(from, to, before)}>
        {this.state.items.map((item, i) => {
          if (isString(item.content)) {
            return <Typography key={i} variant='document' contentType='text' content={item.content} />;
          }
          return item.content;
        })}
      </Sortable>,
    ];
  }

  private async onSortItems(from: number, to: number, before: boolean) {
    if (from === to) return;

    // Clone the array to avoid modifying the state directly
    const items = [...this.state.items];

    // Remove the item at the "from" index
    const [item] = items.splice(from, 1);

    // Adjust the target index if the item was originally before "to"
    const adjustedTo = from < to ? to - 1 : to;

    // Determine the final insertion index
    const insertionIndex = before ? adjustedTo : adjustedTo + 1;

    // Insert the item at the new position
    items.splice(insertionIndex, 0, item!);

    // Update the state
    await this.setStateAsync({ items });
  }
}
