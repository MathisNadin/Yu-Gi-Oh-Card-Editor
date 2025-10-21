import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { DateTimeRangePicker, IDateTimeRange, IDateTimeRangePickerProps } from './DateTimeRangePicker';

interface IDateTimeRangePickerFieldProps extends IFormFieldProps<IDateTimeRange>, IDateTimeRangePickerProps {}

interface IDateTimeRangePickerFieldState extends IFormFieldState {}

export class DateTimeRangePickerField extends FormField<
  IDateTimeRange,
  IDateTimeRangePickerFieldProps,
  IDateTimeRangePickerFieldState
> {
  public static override get defaultProps(): Omit<
    IDateTimeRangePickerFieldProps,
    'label' | 'value' | 'onChange' | 'fieldId' | 'fieldName'
  > {
    return {
      ...super.defaultProps,
      canReset: DateTimeRangePicker.defaultProps.canReset,
    };
  }

  public constructor(props: IDateTimeRangePickerFieldProps) {
    super(props, 'date-time-range-picker');
  }

  public override get hasValue(): boolean {
    return !!this.value?.lowerDateTime && !!this.value?.higherDateTime;
  }

  protected override renderControl() {
    return (
      <DateTimeRangePicker
        disabled={this.props.disabled}
        lowerFieldId={this.props.fieldId}
        lowerFieldName={this.props.fieldName}
        higherFieldId={`${this.props.fieldId}-higher`}
        higherFieldName={`${this.props.fieldName}-higher`}
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
