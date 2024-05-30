import { IFormFieldProps, IFormFieldState, FormField } from '../form';
import { HorizontalStack } from '../container';
import { IRangeSliderProps, IRangeSliderValues, RangeSlider } from './RangeSlider';

interface IRangeSliderFieldProps extends IFormFieldProps<IRangeSliderValues>, IRangeSliderProps {}

interface IRangeSliderFieldState extends IFormFieldState<IRangeSliderValues> {}

/** Create RangeSlider field.
 *
 * Constructeur need IRangeSliderFieldProps.
 *
 * For more options look FormField.
 */
export class RangeSliderField extends FormField<IRangeSliderValues, IRangeSliderFieldProps, IRangeSliderFieldState> {
  public static get defaultProps(): IRangeSliderFieldProps {
    return {
      ...super.defaultProps,
      showLabel: false,
      showDecoration: false,
      ...RangeSlider.defaultProps,
    };
  }

  public constructor(props: IRangeSliderFieldProps) {
    super(props, 'range-slider');
    this.state = {
      ...this.state,
      value: props.defaultValue || { lower: props.min, upper: props.max },
    };
  }

  public componentDidUpdate() {
    if (this.props.defaultValue === this.state.value) return;
    this.setState({ value: this.props.defaultValue || { lower: this.props.min, upper: this.props.max } });
  }

  public get hasValue() {
    return true;
  }

  public get value() {
    return this.state.value;
  }

  private async onChange(value: IRangeSliderValues) {
    await this.setStateAsync({ value });
    this.fireValueChanged();
    if (this.props.onChange) await this.props.onChange(value);
  }

  public renderControl() {
    return (
      <HorizontalStack verticalItemAlignment='middle' width='100%' gutter>
        {this.renderLabel()}
        <RangeSlider
          disabled={this.props.disabled}
          defaultValue={this.state.value}
          valueDisplayMode={this.props.valueDisplayMode}
          min={this.props.min}
          max={this.props.max}
          step={this.props.step}
          color={this.props.color}
          marks={this.props.marks}
          onChange={(value) => this.onChange(value)}
        />
      </HorizontalStack>
    );
  }
}
