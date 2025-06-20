import { HorizontalStack } from '../container';
import { IFormFieldProps, IFormFieldState, FormField } from '../form';
import { Toggle, IToggleProps } from './Toggle';

interface IToggleFieldProps extends IFormFieldProps<boolean>, IToggleProps {}

interface IToggleFieldState extends IFormFieldState {}

export class ToggleField extends FormField<boolean, IToggleFieldProps, IToggleFieldState> {
  public static get defaultProps(): Omit<IToggleFieldProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      hideLabel: true,
      label: '',
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
        <Toggle disabled={this.props.disabled} value={this.value} onChange={(value) => this.onChange(value)} />
      </HorizontalStack>
    );
  }
}
