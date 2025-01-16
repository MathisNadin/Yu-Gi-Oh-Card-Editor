import { isDefined } from 'mn-tools';
import { IFormFieldProps, IFormFieldState, FormField } from '../form';
import { HorizontalStack } from '../container';
import { IRangeSliderProps, IRangeSliderValues, RangeSlider } from './RangeSlider';

interface IRangeSliderFieldProps extends IFormFieldProps<IRangeSliderValues>, IRangeSliderProps {}

interface IRangeSliderFieldState extends IFormFieldState<IRangeSliderValues> {}

export class RangeSliderField extends FormField<IRangeSliderValues, IRangeSliderFieldProps, IRangeSliderFieldState> {
  public static override get defaultProps(): IRangeSliderFieldProps {
    return {
      ...super.defaultProps,
      ...RangeSlider.defaultProps,
      hideLabel: true,
    };
  }

  public constructor(props: IRangeSliderFieldProps) {
    super(props, 'range-slider');
    this.state = {
      ...this.state,
      value: props.defaultValue || { lower: props.min, upper: props.max },
    };
  }

  protected async updateFromNewProps(prevProps: Readonly<IRangeSliderFieldProps>) {
    if (prevProps === this.props) return;
    if (this.props.defaultValue === this.state.value) return;
    await this.setStateAsync({ value: this.props.defaultValue || { lower: this.props.min, upper: this.props.max } });
    if (this.hasValue) await this.doValidation();
  }

  public override get hasValue() {
    return isDefined(this.value?.lower) && isDefined(this.value?.upper);
  }

  protected override renderControl() {
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
