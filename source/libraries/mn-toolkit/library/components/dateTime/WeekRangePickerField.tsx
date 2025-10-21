import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { WeekRangePicker, IWeekRange, IWeekRangePickerProps } from './WeekRangePicker';

interface IWeekRangePickerFieldProps extends IFormFieldProps<IWeekRange>, IWeekRangePickerProps {}

interface IWeekRangePickerFieldState extends IFormFieldState {}

export class WeekRangePickerField extends FormField<
  IWeekRange,
  IWeekRangePickerFieldProps,
  IWeekRangePickerFieldState
> {
  public static override get defaultProps(): Omit<
    IWeekRangePickerFieldProps,
    'label' | 'value' | 'onChange' | 'fieldId' | 'fieldName'
  > {
    return {
      ...super.defaultProps,
      canReset: WeekRangePicker.defaultProps.canReset,
      higherPopupTitle: WeekRangePicker.defaultProps.higherPopupTitle,
      lowerPopupTitle: WeekRangePicker.defaultProps.lowerPopupTitle,
    };
  }

  public constructor(props: IWeekRangePickerFieldProps) {
    super(props, 'week-range-picker');
  }

  public override get hasValue(): boolean {
    return !!this.value?.lowerWeek && !!this.value?.higherWeek;
  }

  protected override renderControl() {
    return (
      <WeekRangePicker
        disabled={this.props.disabled}
        lowerFieldId={this.props.fieldId}
        lowerFieldName={this.props.fieldName}
        higherFieldId={`${this.props.fieldId}-higher`}
        higherFieldName={`${this.props.fieldName}-higher`}
        fill={this.props.fill}
        yearRange={this.props.yearRange}
        value={this.value}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
