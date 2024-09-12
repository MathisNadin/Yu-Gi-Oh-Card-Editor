import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { DatePicker, IDatePickerProps } from './DatePicker';

interface IDatePickerFieldProps extends IFormFieldProps<Date>, IDatePickerProps {}

interface IDatePickerFieldState extends IFormFieldState<Date> {}

export class DatePickerField extends FormField<Date, IDatePickerFieldProps, IDatePickerFieldState> {
  public constructor(props: IDatePickerFieldProps) {
    super(props, 'date-picker');
  }

  protected override async updateFromNewProps(prevProps: Readonly<IDatePickerFieldProps>) {
    if (prevProps === this.props) return;
    if (this.props.defaultValue?.getTime() === this.state.value?.getTime()) return;
    await this.setStateAsync({ value: this.props.defaultValue! });
    if (this.hasValue) await this.doValidation();
  }

  protected override renderControl() {
    return (
      <DatePicker
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
