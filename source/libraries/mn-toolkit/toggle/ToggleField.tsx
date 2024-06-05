import { HorizontalStack } from '../container';
import { IFormFieldProps, IFormFieldState, FormField } from '../form';
import { Toggle, IToggleProps } from './Toggle';

interface IToggleFieldProps extends IFormFieldProps<boolean>, IToggleProps {}

interface IToggleFieldState extends IFormFieldState<boolean> {}

export class ToggleField extends FormField<boolean, IToggleFieldProps, IToggleFieldState> {
  public static get defaultProps(): IToggleFieldProps {
    return {
      ...super.defaultProps,
      showLabel: false,
      showDecoration: false,
    };
  }

  public constructor(props: IToggleFieldProps) {
    super(props, 'toggle');
    this.state = {
      ...this.state,
      value: props.defaultValue ?? false,
    };
  }

  public componentDidUpdate() {
    if (this.props.defaultValue === this.state.value) return;
    this.setState({ value: this.props.defaultValue ?? false });
  }

  public get hasValue() {
    return true;
  }

  private onChange(value: boolean) {
    if (!!this.props.onChange) this.props.onChange(value);
    this.setState({ value });
    this.fireValueChanged();
  }

  public renderControl() {
    return (
      <HorizontalStack verticalItemAlignment='middle' width='100%' gutter>
        {this.renderLabel()}
        <Toggle
          disabled={this.props.disabled}
          defaultValue={this.state.value}
          onChange={(value) => this.onChange(value)}
        />
      </HorizontalStack>
    );
  }
}
