import { JSXElementChildren } from '../react';
import { Container, IContainerProps, IContainerState } from '../container';
import { Chip } from './Chip';
import { IChipItem } from './Chips';

export interface IChipInputItem<ID = number> extends Omit<IChipItem<ID>, 'actionIcon' | 'onActionTap'> {}

export interface IChipsInputProps<ID = number> extends IContainerProps {
  placeholder?: string;
  defaultValue?: IChipInputItem<ID>[];
  onChange?: (value: IChipInputItem<ID>[]) => void | Promise<void>;
  onAskCreateId: (label: string) => ID;
}

interface IChipsInputState<ID> extends IContainerState {
  items: IChipInputItem<ID>[];
  inputValue: string;
}

export class ChipsInput<ID = number> extends Container<IChipsInputProps<ID>, IChipsInputState<ID>> {
  public static get defaultProps(): IChipsInputProps {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      gutter: true,
      wrap: true,
      defaultValue: [],
      placeholder: 'Écrivez puis faites "entrer" pour valider...',
      onAskCreateId: (_label: string) => Math.random(),
    };
  }

  public constructor(props: IChipsInputProps<ID>) {
    super(props);
    this.state = {
      ...this.state,
      items: props.defaultValue || [],
      inputValue: '',
    };
  }

  private async handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    await this.setState({ inputValue: event.target.value });
  }

  private async handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' || !this.state.inputValue?.trim()) return;
    await this.addChip(this.state.inputValue.trim());
    await this.setStateAsync({ inputValue: '' });
  }

  private async addChip(label: string) {
    const newItem: IChipInputItem<ID> = {
      id: this.props.onAskCreateId(label),
      label,
    };
    const items = [...this.state.items, newItem];
    await this.setStateAsync({ items });
    if (this.props.onChange) await this.props.onChange(items);
  }

  private async removeChip(id: ID) {
    const items = this.state.items.filter((item) => item.id !== id);
    await this.setStateAsync({ items });
    if (this.props.onChange) await this.props.onChange(items);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-chips-input'] = true;
    return classes;
  }

  public override get children(): JSXElementChildren {
    return [
      this.state.items.map((item, i) => (
        <Chip
          key={`chip-${i}`}
          selected
          className={item.className}
          label={item.label}
          color={item.color}
          onTap={(e) => item.onTapOverride && item.onTapOverride(e)}
          icon={item.icon}
          actionIcon='toolkit-close-disc'
          onActionTap={() => this.removeChip(item.id)}
        />
      )),
      <input
        key='input'
        type='text'
        value={this.state.inputValue}
        placeholder={this.props.disabled ? '' : this.props.placeholder}
        onChange={(e) => app.$errorManager.handlePromise(this.handleInputChange(e))}
        onKeyDown={(e) => app.$errorManager.handlePromise(this.handleKeyDown(e))}
      />,
    ];
  }
}
