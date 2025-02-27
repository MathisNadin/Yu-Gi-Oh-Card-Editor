import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { CheckboxTree, ICheckboxTreeSpecificProps } from './CheckboxTree';

interface ICheckboxTreeFieldProps<ID = number> extends IFormFieldProps<ID[]>, ICheckboxTreeSpecificProps<ID> {}

interface ICheckboxTreeFieldState<ID> extends IFormFieldState<ID[]> {}

export class CheckboxTreeField<ID = number> extends FormField<
  ID[],
  ICheckboxTreeFieldProps<ID>,
  ICheckboxTreeFieldState<ID>
> {
  public static override get defaultProps(): ICheckboxTreeFieldProps {
    return {
      ...super.defaultProps,
      items: [],
      defaultValue: [],
    };
  }

  public constructor(props: ICheckboxTreeFieldProps<ID>) {
    super(props, 'checkbox-tree');
  }

  protected override renderControl() {
    return (
      <CheckboxTree<ID>
        disabled={this.props.disabled}
        items={this.props.items}
        defaultValue={this.state.value}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
