import { HorizontalStack } from '../container';
import { IFormFieldProps, IFormFieldState, FormField } from '../form';
import { Toggle, IToggleProps } from './Toggle';

interface IToggleFieldProps extends IFormFieldProps<boolean>, IToggleProps {}

interface IToggleFieldState extends IFormFieldState<boolean> {}

export class ToggleField extends FormField<boolean, IToggleFieldProps, IToggleFieldState> {
  public static get defaultProps(): IToggleFieldProps {
    return {
      ...super.defaultProps,
      hideLabel: true,
      defaultValue: false,
    };
  }

  public constructor(props: IToggleFieldProps) {
    super(props, 'toggle');
  }

  public override get hasValue() {
    return true;
  }

  protected override renderControl() {
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
