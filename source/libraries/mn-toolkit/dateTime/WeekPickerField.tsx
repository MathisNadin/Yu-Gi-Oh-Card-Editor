import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { WeekPicker, IWeekPickerProps } from './WeekPicker';

interface IWeekPickerFieldProps extends IFormFieldProps<Date>, IWeekPickerProps {}

interface IWeekPickerFieldState extends IFormFieldState<Date> {}

export class WeekPickerField extends FormField<Date, IWeekPickerFieldProps, IWeekPickerFieldState> {
  public constructor(props: IWeekPickerFieldProps) {
    super(props, 'week-picker');
    this.state = {
      ...this.state,
      value: props.defaultValue!,
    };
  }

  protected override async updateFromNewProps(prevProps: Readonly<IWeekPickerFieldProps>) {
    if (prevProps === this.props) return;
    if (this.props.defaultValue?.getTime() === this.state.value?.getTime()) return;
    await this.setStateAsync({ value: this.props.defaultValue! });
    if (this.hasValue) await this.doValidation();
  }

  protected override renderControl() {
    return (
      <WeekPicker
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
