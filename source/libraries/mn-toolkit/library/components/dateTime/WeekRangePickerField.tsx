import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { WeekRangePicker, IWeekRange, IWeekRangePickerProps } from './WeekRangePicker';

interface IWeekRangePickerFieldProps extends IFormFieldProps<IWeekRange>, IWeekRangePickerProps {}

interface IWeekRangePickerFieldState extends IFormFieldState<IWeekRange> {}

export class WeekRangePickerField extends FormField<
  IWeekRange,
  IWeekRangePickerFieldProps,
  IWeekRangePickerFieldState
> {
  public static override get defaultProps(): IWeekRangePickerFieldProps {
    return {
      ...super.defaultProps,
      defaultValue: { lowerWeek: undefined, higherWeek: undefined },
    };
  }

  public constructor(props: IWeekRangePickerFieldProps) {
    super(props, 'week-range-picker');
    this.state = {
      ...this.state,
      value: props.defaultValue || { lowerWeek: undefined, higherWeek: undefined },
    };
  }

  protected override async updateFromNewProps(prevProps: Readonly<IWeekRangePickerFieldProps>) {
    if (prevProps === this.props) return;
    if (
      this.props.defaultValue !== this.state.value ||
      this.props.defaultValue?.lowerWeek?.getTime() !== this.state.value?.lowerWeek?.getTime() ||
      this.props.defaultValue?.higherWeek?.getTime() !== this.state.value?.higherWeek?.getTime()
    ) {
      await this.setStateAsync({
        value: this.props.defaultValue || { lowerWeek: undefined, higherWeek: undefined },
      });
      if (this.hasValue) await this.doValidation();
    }
  }

  public override get hasValue(): boolean {
    return !!this.state.value?.lowerWeek && !!this.state.value?.higherWeek;
  }

  protected override renderControl() {
    return (
      <WeekRangePicker
        disabled={this.props.disabled}
        fill={this.props.fill}
        yearRange={this.props.yearRange}
        defaultValue={this.state.value}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
