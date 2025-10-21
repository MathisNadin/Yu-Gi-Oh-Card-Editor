import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { TimePicker, ITimePickerProps } from './TimePicker';

interface ITimePickerFieldProps extends IFormFieldProps<Date | undefined>, ITimePickerProps {}

interface ITimePickerFieldState extends IFormFieldState {}

export class TimePickerField extends FormField<Date | undefined, ITimePickerFieldProps, ITimePickerFieldState> {
  public static override get defaultProps(): Omit<
    ITimePickerFieldProps,
    'label' | 'value' | 'onChange' | 'fieldId' | 'fieldName'
  > {
    return {
      ...super.defaultProps,
      canReset: TimePicker.defaultProps.canReset,
    };
  }

  public constructor(props: ITimePickerFieldProps) {
    super(props, 'time-picker');
  }

  protected override renderControl() {
    return (
      <TimePicker
        disabled={this.props.disabled}
        inputId={this.props.fieldId}
        inputName={this.props.fieldName}
        fill={this.props.fill}
        canReset={this.props.canReset}
        value={this.value}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
