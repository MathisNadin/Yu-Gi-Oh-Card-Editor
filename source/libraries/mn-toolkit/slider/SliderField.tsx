import { IFormFieldProps, IFormFieldState, FormField } from '../form';
import { HorizontalStack } from '../container';
import { ISliderProps, Slider } from './Slider';

interface ISliderFieldProps extends IFormFieldProps<number>, ISliderProps {}

interface ISliderFieldState extends IFormFieldState<number> {}

export class SliderField extends FormField<number, ISliderFieldProps, ISliderFieldState> {
  public static get defaultProps(): ISliderFieldProps {
    return {
      ...super.defaultProps,
      ...Slider.defaultProps,
      hideLabel: true,
      defaultValue: 0,
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
