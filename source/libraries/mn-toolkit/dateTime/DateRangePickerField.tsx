import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { DateRangePicker, IDateRange, IDateRangePickerProps } from './DateRangePicker';

interface IDateRangePickerFieldProps extends IFormFieldProps<IDateRange>, IDateRangePickerProps {}

interface IDateRangePickerFieldState extends IFormFieldState<IDateRange> {}

export class DateRangePickerField extends FormField<
  IDateRange,
  IDateRangePickerFieldProps,
  IDateRangePickerFieldState
> {
  public static get defaultProps(): IDateRangePickerFieldProps {
    return {
      ...super.defaultProps,
      defaultValue: { lowerDate: undefined, higherDate: undefined },
    };
  }

  public constructor(props: IDateRangePickerFieldProps) {
    super(props, 'date-range-picker');
    this.state = {
      ...this.state,
      value: props.defaultValue || { lowerDate: undefined, higherDate: undefined },
    };
  }

  protected override async updateFromNewProps(prevProps: Readonly<IDateRangePickerFieldProps>) {
    if (prevProps === this.props) return;
    if (
      this.props.defaultValue !== this.state.value ||
      this.props.defaultValue?.lowerDate?.getTime() !== this.state.value?.lowerDate?.getTime() ||
      this.props.defaultValue?.higherDate?.getTime() !== this.state.value?.higherDate?.getTime()
    ) {
      await this.setStateAsync({ value: this.props.defaultValue || { lowerDate: undefined, higherDate: undefined } });
      if (this.hasValue) await this.doValidation();
    }
  }

  public override get hasValue() {
    return !!this.state.value?.lowerDate && !!this.state.value?.higherDate;
  }

  protected override renderControl() {
    return (
      <DateRangePicker
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
