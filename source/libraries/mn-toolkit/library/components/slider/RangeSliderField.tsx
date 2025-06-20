import { isNumber } from 'mn-tools';
import { IFormFieldProps, IFormFieldState, FormField } from '../form';
import { HorizontalStack } from '../container';
import { IRangeSliderProps, IRangeSliderValues, RangeSlider } from './RangeSlider';

interface IRangeSliderFieldProps extends IFormFieldProps<IRangeSliderValues>, IRangeSliderProps {}

interface IRangeSliderFieldState extends IFormFieldState {}

export class RangeSliderField extends FormField<IRangeSliderValues, IRangeSliderFieldProps, IRangeSliderFieldState> {
  public static override get defaultProps(): Omit<
    IRangeSliderFieldProps,
    'min' | 'max' | 'step' | 'value' | 'onChange'
  > {
    return {
      ...super.defaultProps,
      hideLabel: true,
      label: '',
      valueDisplayMode: RangeSlider.defaultProps.valueDisplayMode,
    };
  }

  public constructor(props: IRangeSliderFieldProps) {
    super(props, 'range-slider');
  }

  public override get hasValue() {
    return isNumber(this.value?.lower) && isNumber(this.value?.upper);
  }

  protected override renderControl() {
    return (
      <HorizontalStack verticalItemAlignment='middle' width='100%' gutter>
        {this.renderLabel()}
        <RangeSlider
          disabled={this.props.disabled}
          min={this.props.min}
          max={this.props.max}
          step={this.props.step}
          color={this.props.color}
          marks={this.props.marks}
          valueDisplayMode={this.props.valueDisplayMode}
          value={this.value}
          onChange={(value) => this.onChange(value)}
        />
      </HorizontalStack>
    );
  }
}
