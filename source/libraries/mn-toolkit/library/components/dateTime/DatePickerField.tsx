import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { DatePicker, IDatePickerProps } from './DatePicker';

interface IDatePickerFieldProps extends IFormFieldProps<Date | undefined>, IDatePickerProps {}

interface IDatePickerFieldState extends IFormFieldState {}

export class DatePickerField extends FormField<Date | undefined, IDatePickerFieldProps, IDatePickerFieldState> {
  public static override get defaultProps(): Omit<IDatePickerFieldProps, 'label' | 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      canReset: DatePicker.defaultProps.canReset,
    };
  }

  public constructor(props: IDatePickerFieldProps) {
    super(props, 'date-picker');
  }

  protected override renderControl() {
    return (
      <DatePicker
        disabled={this.props.disabled}
        fill={this.props.fill}
        yearRange={this.props.yearRange}
        canReset={this.props.canReset}
        value={this.value}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
