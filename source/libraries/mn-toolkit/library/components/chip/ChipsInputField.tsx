import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { ChipsInput, IChipInputItem, IChipsInputProps } from './ChipsInput';

interface IChipsInputFieldProps<ID = number> extends IFormFieldProps<IChipInputItem<ID>[]>, IChipsInputProps<ID> {}

interface IChipsInputFieldState<ID = number> extends IFormFieldState<IChipInputItem<ID>[]> {}

export class ChipsInputField<ID = number> extends FormField<
  IChipInputItem<ID>[],
  IChipsInputFieldProps<ID>,
  IChipsInputFieldState<ID>
> {
  public static override get defaultProps(): IChipsInputFieldProps {
    return {
      ...super.defaultProps,
      defaultValue: [],
      onAskCreateId: (_label: string) => Math.random(),
    };
  }

  public constructor(props: IChipsInputFieldProps<ID>) {
    super(props, 'chips-input');
  }

  protected override renderControl() {
    return (
      <ChipsInput<ID>
        disabled={this.props.disabled}
        placeholder={this.props.placeholder}
        defaultValue={this.props.defaultValue}
        onChange={(value) => this.onChange(value)}
        onAskCreateId={(label) => this.props.onAskCreateId(label)}
      />
    );
  }
}
