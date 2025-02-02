import { TJSXElementChildren } from '../../system';
import { TDidUpdateSnapshot } from '../containable';
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
  defaultValue?: ID[];
  items: ISelectChipItem<ID>[];
  onChange?: (value: ID[]) => void | Promise<void>;
}

interface ISelectChipsState<ID = number> extends IContainerState {
  selected: ID[];
  items: ISelectChipItem<ID>[];
}

export class SelectChips<ID = number> extends Container<ISelectChipsProps<ID>, ISelectChipsState<ID>> {
  public static override get defaultProps(): ISelectChipsProps {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      verticalItemAlignment: 'middle',
      gutter: true,
      defaultValue: [],
      items: [],
      placeholder: 'Choisissez une option',
    };
  }

  public constructor(props: ISelectChipsProps<ID>) {
    super(props);
    this.state = {
      ...this.state,
      selected: props.defaultValue || [],
      items: props.items || [],
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<ISelectChipsProps<ID>>,
    prevState: Readonly<ISelectChipsState<ID>>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    if (prevProps.items !== this.props.items || prevProps.defaultValue !== this.props.defaultValue) {
      this.setState({ items: this.props.items, selected: this.props.defaultValue || [] });
    }
  }

  private showItems() {
    if (this.props.disabled || !this.base.current) return;
    app.$popover.show({
      eventOrRect: this.base.current.getBoundingClientRect(),
      type: 'actions select-chips',
      Component: SelectChipsPopover<ID>,
      componentProps: {
        syncWidth: true,
        maxVisibleActions: 5,
        actions: this.state.items.map((item) => ({
          id: item.id,
          label: item.label,
          isTitle: item.isTitle,
          isSubTitle: item.isSubTitle,
          selected: this.state.selected.includes(item.id),
          onTap: () => this.toggleChip(item.id),
        })),
      },
    });
  }

  private async toggleChip(id: ID) {
    let selected: ID[] = [];
    if (this.state.selected.includes(id)) {
      selected = this.state.selected.filter((itemId) => itemId !== id);
    } else {
      selected = [...this.state.selected, id];
    }
    await this.setStateAsync({ selected });
    if (this.props.onChange) await this.props.onChange(this.state.selected);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-select-chips'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    const selectedItems = this.state.items.filter((item) => this.state.selected.includes(item.id));
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
              key={`${item.id}`}
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
      <HorizontalStack
        key='drop-icon'
        className='drop-icon'
        verticalItemAlignment='middle'
        itemAlignment='center'
        onTap={() => this.showItems()}
      >
        <Icon icon='toolkit-angle-down' />
      </HorizontalStack>,
    ];
  }
}
