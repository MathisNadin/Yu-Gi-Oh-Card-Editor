import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { DateTimePicker, IDateTimePickerProps } from './DateTimePicker';

interface IDateTimePickerFieldProps extends IFormFieldProps<Date | undefined>, IDateTimePickerProps {}

interface IDateTimePickerFieldState extends IFormFieldState {}

export class DateTimePickerField extends FormField<
  Date | undefined,
  IDateTimePickerFieldProps,
  IDateTimePickerFieldState
> {
  public static override get defaultProps(): Omit<
    IDateTimePickerFieldProps,
    'label' | 'value' | 'onChange' | 'fieldId' | 'fieldName'
  > {
    return {
      ...super.defaultProps,
      canReset: DateTimePicker.defaultProps.canReset,
    };
  }

  public constructor(props: IDateTimePickerFieldProps) {
    super(props, 'date-time-picker');
  }

  protected override renderControl() {
    return (
      <DateTimePicker
        disabled={this.props.disabled}
        inputId={this.props.fieldId}
        inputName={this.props.fieldName}
        fill={this.props.fill}
        yearRange={this.props.yearRange}
        canReset={this.props.canReset}
        value={this.value}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
