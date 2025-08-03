import { TJSXElementChildren } from '../../system';
import { Container, IContainerProps, IContainerState } from '../container';
import { Chip } from './Chip';
import { IChipItem } from './Chips';

export interface IChipInputItem<ID = number> extends Omit<IChipItem<ID>, 'actionIcon' | 'onActionTap'> {}

export interface IChipsInputProps<ID = number> extends IContainerProps {
  placeholder?: string;
  value: IChipInputItem<ID>[];
  onChange: (value: IChipInputItem<ID>[]) => void | Promise<void>;
  onAskCreateId: (label: string) => ID;
}

interface IChipsInputState extends IContainerState {
  inputValue: string;
}

export class ChipsInput<ID = number> extends Container<IChipsInputProps<ID>, IChipsInputState> {
  public static override get defaultProps(): Omit<IChipsInputProps, 'value' | 'onChange' | 'onAskCreateId'> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      gutterX: true,
      gutterY: 'small',
      wrap: true,
      placeholder: 'Écrivez puis faites "entrer" pour valider...',
    };
  }

  public constructor(props: IChipsInputProps<ID>) {
    super(props);
    this.state = {
      ...this.state,
      inputValue: '',
    };
  }

  private async handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    await this.setStateAsync({ inputValue: (event.target as HTMLInputElement).value || '' });
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
    const items = [...this.props.value, newItem];
    await this.props.onChange(items);
  }

  private async removeChip(id: ID) {
    const items = this.props.value.filter((item) => item.id !== id);
    await this.props.onChange(items);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-chips-input'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    return [
      this.props.value.map((chip, i) => (
        <Chip
          key={`chip-${i}`}
          selected
          className={chip.className}
          label={chip.label}
          color={chip.color}
          onTap={chip.onTapOverride ? (e) => chip.onTapOverride!(e) : undefined}
          icon={chip.icon}
          actionIcon='toolkit-close-disc'
          onActionTap={() => this.removeChip(chip.id)}
        />
      )),
      <input
        key='input'
        type='text'
        placeholder={this.props.disabled ? '' : this.props.placeholder}
        value={this.state.inputValue}
        onChange={(e) => app.$errorManager.handlePromise(this.handleInputChange(e))}
        onKeyDown={(e) => app.$errorManager.handlePromise(this.handleKeyDown(e))}
      />,
    ];
  }
}
