import { TJSXElementChildren, TForegroundColor } from '../../system';
import { TDidUpdateSnapshot } from '../containable';
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
  defaultValue?: ID[];
  onChange?: (items: ID[]) => void | Promise<void>;
}

interface IChipsState<ID> extends IContainerState {
  items: ID[];
}

export class Chips<ID = number> extends Container<IChipsProps<ID>, IChipsState<ID>> {
  public static override get defaultProps(): IChipsProps {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      gutter: true,
      wrap: true,
      items: [],
    };
  }

  public constructor(props: IChipsProps<ID>) {
    super(props);
    this.state = {
      ...this.state,
      items: props.defaultValue || [],
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IChipsProps<ID>>,
    prevState: Readonly<IChipsState<ID>>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    if (this.props.defaultValue !== this.state.items) {
      this.setState({ items: this.props.defaultValue || [] });
    }
  }

  private isSelected(item: IChipItem<ID>) {
    return this.state.items.includes(item.id);
  }

  private async onItemTap(event: React.MouseEvent<HTMLDivElement>, item: IChipItem<ID>) {
    if (item.onTapOverride) {
      await item.onTapOverride(event);
    } else {
      if (this.props.multiple) {
        if (this.isSelected(item)) {
          await this.setStateAsync({ items: this.state.items.filter((i) => i !== item.id) });
        } else {
          await this.setStateAsync({ items: this.state.items.concat([item.id]) });
        }
      } else {
        await this.setStateAsync({ items: [item.id] });
      }
      if (this.props.onChange) await this.props.onChange(this.state.items);
    }
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-chips'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    return this.props.items.map((item) => (
      <Chip
        key={`${item.id}`}
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
