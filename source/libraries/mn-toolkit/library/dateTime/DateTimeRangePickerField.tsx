import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { DateTimeRangePicker, IDateTimeRange, IDateTimeRangePickerProps } from './DateTimeRangePicker';

interface IDateTimeRangePickerFieldProps extends IFormFieldProps<IDateTimeRange>, IDateTimeRangePickerProps {}

interface IDateTimeRangePickerFieldState extends IFormFieldState<IDateTimeRange> {}

export class DateTimeRangePickerField extends FormField<
  IDateTimeRange,
  IDateTimeRangePickerFieldProps,
  IDateTimeRangePickerFieldState
> {
  public static get defaultProps(): IDateTimeRangePickerFieldProps {
    return {
      ...super.defaultProps,
      defaultValue: { lowerDateTime: undefined, higherDateTime: undefined },
    };
  }

  public constructor(props: IDateTimeRangePickerFieldProps) {
    super(props, 'date-time-range-picker');
    this.state = {
      ...this.state,
      value: props.defaultValue || { lowerDateTime: undefined, higherDateTime: undefined },
    };
  }

  protected override async updateFromNewProps(prevProps: Readonly<IDateTimeRangePickerFieldProps>) {
    if (prevProps === this.props) return;
    if (
      this.props.defaultValue !== this.state.value ||
      this.props.defaultValue?.lowerDateTime?.getTime() !== this.state.value?.lowerDateTime?.getTime() ||
      this.props.defaultValue?.higherDateTime?.getTime() !== this.state.value?.higherDateTime?.getTime()
    ) {
      await this.setStateAsync({
        value: this.props.defaultValue || { lowerDateTime: undefined, higherDateTime: undefined },
      });
      if (this.hasValue) await this.doValidation();
    }
  }

  public override get hasValue(): boolean {
    return !!this.state.value?.lowerDateTime && !!this.state.value?.higherDateTime;
  }

  protected override renderControl() {
    return (
      <DateTimeRangePicker
        disabled={this.props.disabled}
        fill={this.props.fill}
        lowerPopupTitle={this.props.lowerPopupTitle}
        higherPopupTitle={this.props.higherPopupTitle}
        yearRange={this.props.yearRange}
        defaultValue={this.state.value}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
