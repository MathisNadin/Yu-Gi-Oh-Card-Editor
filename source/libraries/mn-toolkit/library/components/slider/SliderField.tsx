import { IFormFieldProps, IFormFieldState, FormField } from '../form';
import { HorizontalStack } from '../container';
import { ISliderProps, Slider } from './Slider';

interface ISliderFieldProps extends IFormFieldProps<number>, ISliderProps {}

interface ISliderFieldState extends IFormFieldState {}

export class SliderField extends FormField<number, ISliderFieldProps, ISliderFieldState> {
  public static get defaultProps(): Omit<ISliderFieldProps, 'min' | 'max' | 'step' | 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      hideLabel: true,
      label: '',
      valueDisplayMode: Slider.defaultProps.valueDisplayMode,
    };
  }

  public constructor(props: ISliderFieldProps) {
    super(props, 'slider');
  }

  public override get hasValue() {
    return true;
  }

  protected override renderControl() {
    return (
      <HorizontalStack verticalItemAlignment='middle' width='100%' gutter>
        {this.renderLabel()}
        <Slider
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
