import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { Checkbox, ICheckboxProps } from './Checkbox';

interface ICheckboxFieldProps extends IFormFieldProps<boolean>, ICheckboxProps {}

interface ICheckboxFieldState extends IFormFieldState {}

export class CheckboxField extends FormField<boolean, ICheckboxFieldProps, ICheckboxFieldState> {
  public static override get defaultProps(): Omit<ICheckboxFieldProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      label: '',
      hideLabel: true,
    };
  }

  public constructor(props: ICheckboxFieldProps) {
    super(props, 'checkbox');
  }

  protected override renderControl() {
    return (
      <Checkbox
        disabled={this.props.disabled}
        label={this.props.label}
        labelPosition={this.props.labelPosition}
        value={this.value}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
