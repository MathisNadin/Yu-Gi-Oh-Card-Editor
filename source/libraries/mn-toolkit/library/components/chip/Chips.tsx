import { TJSXElementChildren, TForegroundColor } from '../../system';
import { Container, IContainerProps, IContainerState } from '../container';
import { TIconId } from '../icon';
import { Chip } from './Chip';

export interface IChipItem<ID = number> {
  id: ID;
  label: string;
  className?: string;
  color?: TForegroundColor;
  onTapOverride?: (event: React.MouseEvent<HTMLDivElement>) => void | Promise<void>;
  icon?: TIconId;
  actionIcon?: TIconId;
  onActionTap?: (event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void | Promise<void>;
}

export interface IChipsProps<ID = number> extends IContainerProps {
  multiple?: boolean;
  items: IChipItem<ID>[];
  value: ID[];
  onChange: (items: ID[]) => void | Promise<void>;
}

interface IChipsState extends IContainerState {}

export class Chips<ID = number> extends Container<IChipsProps<ID>, IChipsState> {
  public static override get defaultProps(): Omit<IChipsProps, 'items' | 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      gutter: 'default',
      wrap: true,
    };
  }

  private isSelected(item: IChipItem<ID>) {
    return this.props.value.includes(item.id);
  }

  private async onItemTap(event: React.MouseEvent<HTMLDivElement>, item: IChipItem<ID>) {
    if (item.onTapOverride) {
      await item.onTapOverride(event);
      return;
    }

    let newValue: ID[];

    if (this.props.multiple) {
      if (this.isSelected(item)) {
        newValue = this.props.value.filter((i) => i !== item.id);
      } else {
        newValue = [...this.props.value, item.id];
      }
    } else {
      newValue = [item.id];
    }

    await this.props.onChange(newValue);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-chips'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    return this.props.items.map((item) => (
      <Chip
        key={String(item.id)}
        disabled={this.props.disabled}
        className={item.className}
        selected={this.isSelected(item)}
        label={item.label}
        color={item.color}
        onTap={(e) => this.onItemTap(e, item)}
        icon={item.icon}
        actionIcon={item.actionIcon}
        onActionTap={item.onActionTap}
      />
    ));
  }
}
