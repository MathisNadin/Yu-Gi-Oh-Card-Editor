import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { Checkbox, ICheckboxProps } from './Checkbox';

interface ICheckboxFieldProps extends IFormFieldProps<boolean>, ICheckboxProps {}

interface ICheckboxFieldState extends IFormFieldState<boolean> {}

export class CheckboxField extends FormField<boolean, ICheckboxFieldProps, ICheckboxFieldState> {
  public static override get defaultProps(): ICheckboxFieldProps {
    return {
      ...super.defaultProps,
      hideLabel: true,
      defaultValue: false,
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
        defaultValue={this.state.value}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
