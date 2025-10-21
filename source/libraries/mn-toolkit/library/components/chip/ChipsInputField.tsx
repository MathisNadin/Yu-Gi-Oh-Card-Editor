import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { ChipsInput, IChipInputItem, IChipsInputProps } from './ChipsInput';

interface IChipsInputFieldProps<ID = number> extends IFormFieldProps<IChipInputItem<ID>[]>, IChipsInputProps<ID> {}

interface IChipsInputFieldState extends IFormFieldState {}

export class ChipsInputField<ID = number> extends FormField<
  IChipInputItem<ID>[],
  IChipsInputFieldProps<ID>,
  IChipsInputFieldState
> {
  public static override get defaultProps(): Omit<
    IChipsInputFieldProps,
    'label' | 'value' | 'onChange' | 'fieldId' | 'fieldName' | 'onAskCreateId'
  > {
    return {
      ...super.defaultProps,
    };
  }

  public constructor(props: IChipsInputFieldProps<ID>) {
    super(props, 'chips-input');
  }

  protected override renderControl() {
    return (
      <ChipsInput<ID>
        disabled={this.props.disabled}
        inputId={this.props.fieldId}
        inputName={this.props.fieldName}
        placeholder={this.props.placeholder}
        value={this.props.value}
        onChange={(value) => this.onChange(value)}
        onAskCreateId={(label) => this.props.onAskCreateId(label)}
      />
    );
  }
}
