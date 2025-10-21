import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { WeekPicker, IWeekPickerProps } from './WeekPicker';

interface IWeekPickerFieldProps extends IFormFieldProps<Date | undefined>, IWeekPickerProps {}

interface IWeekPickerFieldState extends IFormFieldState {}

export class WeekPickerField extends FormField<Date | undefined, IWeekPickerFieldProps, IWeekPickerFieldState> {
  public static override get defaultProps(): Omit<
    IWeekPickerFieldProps,
    'label' | 'value' | 'onChange' | 'fieldId' | 'fieldName'
  > {
    return {
      ...super.defaultProps,
      canReset: WeekPicker.defaultProps.canReset,
    };
  }

  public constructor(props: IWeekPickerFieldProps) {
    super(props, 'week-picker');
  }

  protected override renderControl() {
    return (
      <WeekPicker
        disabled={this.props.disabled}
        inputId={this.props.fieldId}
        inputName={this.props.fieldName}
        fill={this.props.fill}
        yearRange={this.props.yearRange}
        canReset={this.props.canReset}
        value={this.value}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
