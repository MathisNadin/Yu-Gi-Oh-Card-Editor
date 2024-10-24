import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { Chips, IChipsProps } from './Chips';

interface IChipsFieldProps<ID = number> extends IFormFieldProps<ID[]>, IChipsProps<ID> {}

interface IChipsFieldState<ID> extends IFormFieldState<ID[]> {}

export class ChipsField<ID = number> extends FormField<ID[], IChipsFieldProps<ID>, IChipsFieldState<ID>> {
  public static get defaultProps(): IChipsFieldProps {
    return {
      ...super.defaultProps,
      items: [],
      defaultValue: [],
    };
  }

  public constructor(props: IChipsFieldProps<ID>) {
    super(props, 'chips');
  }

  protected override renderControl() {
    return (
      <Chips<ID>
        disabled={this.props.disabled}
        multiple={this.props.multiple}
        items={this.props.items}
        defaultValue={this.state.value}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
