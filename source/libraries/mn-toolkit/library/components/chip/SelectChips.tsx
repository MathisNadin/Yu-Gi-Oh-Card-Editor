import { TJSXElementChildren } from '../../system';
import { Container, HorizontalStack, IContainerProps, IContainerState } from '../container';
import { Typography } from '../typography';
import { Icon } from '../icon';
import { Chip } from './Chip';
import { IChipItem } from './Chips';
import { SelectChipsPopover } from './SelectChipsPopover';

export interface ISelectChipItem<ID = number> extends Omit<IChipItem<ID>, 'actionIcon' | 'onActionTap'> {
  isTitle?: boolean;
  isSubTitle?: boolean;
}

export interface ISelectChipsProps<ID = number> extends IContainerProps {
  placeholder?: string;
  items: ISelectChipItem<ID>[];
  value: ID[];
  onChange: (value: ID[]) => void | Promise<void>;
}

interface ISelectChipsState extends IContainerState {}

export class SelectChips<ID = number> extends Container<ISelectChipsProps<ID>, ISelectChipsState> {
  public static override get defaultProps(): Omit<ISelectChipsProps, 'items' | 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      verticalItemAlignment: 'middle',
      gutter: 'small',
      placeholder: 'Choisissez une option',
    };
  }

  private showItems() {
    if (this.props.disabled || !this.base.current) return;
    app.$popover.show({
      eventOrElement: this.base.current,
      type: 'actions select-chips',
      Component: SelectChipsPopover<ID>,
      componentProps: {
        syncWidth: true,
        maxVisibleActions: 5,
        actions: this.props.items.map((item) => ({
          id: item.id,
          label: item.label,
          isTitle: item.isTitle,
          isSubTitle: item.isSubTitle,
          selected: this.props.value.includes(item.id),
          onTap: () => this.toggleChip(item.id),
        })),
      },
    });
  }

  private async toggleChip(id: ID) {
    let newValue: ID[];
    if (this.props.value.includes(id)) {
      newValue = this.props.value.filter((itemId) => itemId !== id);
    } else {
      newValue = [...this.props.value, id];
    }
    await this.props.onChange(newValue);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-select-chips'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    const selectedItems = this.props.items.filter((item) => this.props.value.includes(item.id));
    return [
      !selectedItems.length && (
        <Typography
          key='placeholder'
          className='placeholder'
          fill
          italic
          color='3'
          variant='help'
          contentType='text'
          content={this.props.placeholder}
          onTap={() => this.showItems()}
        />
      ),
      !!selectedItems.length && (
        <HorizontalStack key='chips' className='chips' fill gutter wrap>
          {selectedItems.map((item) => (
            <Chip
              key={String(item.id)}
              selected
              className={item.className}
              label={item.label}
              color={item.color}
              onTap={!item.onTapOverride ? undefined : (e) => item.onTapOverride!(e)}
              icon={item.icon}
              actionIcon='toolkit-close-disc'
              onActionTap={() => this.toggleChip(item.id)}
            />
          ))}
        </HorizontalStack>
      ),
      <HorizontalStack key='drop-icon' className='drop-icon' itemAlignment='center' onTap={() => this.showItems()}>
        <Icon icon='toolkit-angle-down' name='Voir les items' />
      </HorizontalStack>,
    ];
  }
}
