import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { TimePicker, ITimePickerProps } from './TimePicker';

interface ITimePickerFieldProps extends IFormFieldProps<Date>, ITimePickerProps {}

interface ITimePickerFieldState extends IFormFieldState<Date> {}

export class TimePickerField extends FormField<Date, ITimePickerFieldProps, ITimePickerFieldState> {
  public constructor(props: ITimePickerFieldProps) {
    super(props, 'time-picker');
    this.state = {
      ...this.state,
      value: props.defaultValue!,
    };
  }

  protected override async updateFromNewProps(prevProps: Readonly<ITimePickerFieldProps>) {
    if (prevProps === this.props) return;
    if (this.props.defaultValue?.getTime() === this.state.value?.getTime()) return;
    await this.setStateAsync({ value: this.props.defaultValue! });
    if (this.hasValue) await this.doValidation();
  }

  protected override renderControl() {
    return (
      <TimePicker
        disabled={this.props.disabled}
        fill={this.props.fill}
        canReset={this.props.canReset}
        defaultValue={this.state.value}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
