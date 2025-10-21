import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { DateRangePicker, IDateRange, IDateRangePickerProps } from './DateRangePicker';

interface IDateRangePickerFieldProps extends IFormFieldProps<IDateRange>, IDateRangePickerProps {}

interface IDateRangePickerFieldState extends IFormFieldState {}

export class DateRangePickerField extends FormField<
  IDateRange,
  IDateRangePickerFieldProps,
  IDateRangePickerFieldState
> {
  public static override get defaultProps(): Omit<
    IDateRangePickerFieldProps,
    'label' | 'value' | 'onChange' | 'fieldId' | 'fieldName'
  > {
    return {
      ...super.defaultProps,
      canReset: DateRangePicker.defaultProps.canReset,
    };
  }

  public constructor(props: IDateRangePickerFieldProps) {
    super(props, 'date-range-picker');
  }

  public override get hasValue() {
    return !!this.value?.lowerDate && !!this.value?.higherDate;
  }

  protected override renderControl() {
    return (
      <DateRangePicker
        disabled={this.props.disabled}
        id={this.props.fieldId}
        name={this.props.fieldName}
        fill={this.props.fill}
        lowerPopupTitle={this.props.lowerPopupTitle}
        higherPopupTitle={this.props.higherPopupTitle}
        yearRange={this.props.yearRange}
        value={this.value}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
