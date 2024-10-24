import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { DateTimePicker, IDateTimePickerProps } from './DateTimePicker';

interface IDateTimePickerFieldProps extends IFormFieldProps<Date>, IDateTimePickerProps {}

interface IDateTimePickerFieldState extends IFormFieldState<Date> {}

export class DateTimePickerField extends FormField<Date, IDateTimePickerFieldProps, IDateTimePickerFieldState> {
  public constructor(props: IDateTimePickerFieldProps) {
    super(props, 'date-time-picker');
    this.state = {
      ...this.state,
      value: props.defaultValue!,
    };
  }

  protected override async updateFromNewProps(prevProps: Readonly<IDateTimePickerFieldProps>) {
    if (prevProps === this.props) return;
    if (this.props.defaultValue?.getTime() === this.state.value?.getTime()) return;
    await this.setStateAsync({ value: this.props.defaultValue! });
    if (this.hasValue) await this.doValidation();
  }

  protected override renderControl() {
    return (
      <DateTimePicker
        disabled={this.props.disabled}
        fill={this.props.fill}
        yearRange={this.props.yearRange}
        canReset={this.props.canReset}
        defaultValue={this.state.value}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
