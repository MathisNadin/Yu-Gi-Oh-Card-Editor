import { IFormFieldProps, IFormFieldState, FormField } from '../form';
import { HorizontalStack } from '../container';
import { ISliderProps, Slider } from './Slider';

interface ISliderFieldProps extends IFormFieldProps<number>, ISliderProps {}

interface ISliderFieldState extends IFormFieldState<number> {}

/** Create Slider field.
 *
 * Constructeur need ISliderFieldProps.
 *
 * For more options look FormField.
 */
export class SliderField extends FormField<number, ISliderFieldProps, ISliderFieldState> {
  public static get defaultProps(): ISliderFieldProps {
    return {
      ...super.defaultProps,
      showLabel: false,
      showDecoration: false,
      ...Slider.defaultProps,
    };
  }

  public constructor(props: ISliderFieldProps) {
    super(props, 'slider');
    this.state = {
      ...this.state,
      value: props.defaultValue ?? 0,
    };
  }

  public componentDidUpdate(prevProps: ISliderProps) {
    if (
      (!this.props.onChange || this.props.defaultValue === prevProps.defaultValue) &&
      this.props.step === prevProps.step
    ) {
      return;
    }

    this.setState({ value: this.props.defaultValue ?? 0 });
  }

  public get hasValue() {
    return true;
  }

  public get value() {
    return this.state.value;
  }

  private async onChange(value: number) {
    await this.setStateAsync({ value });
    this.fireValueChanged();
    if (!!this.props.onChange) await this.props.onChange(value);
  }

  public renderControl() {
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
