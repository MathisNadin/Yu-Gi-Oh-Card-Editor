import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { CheckboxTree, ICheckboxTreeSpecificProps } from './CheckboxTree';

interface ICheckboxTreeFieldProps<ID = number> extends IFormFieldProps<ID[]>, ICheckboxTreeSpecificProps<ID> {}

interface ICheckboxTreeFieldState extends IFormFieldState {}

export class CheckboxTreeField<ID = number> extends FormField<
  ID[],
  ICheckboxTreeFieldProps<ID>,
  ICheckboxTreeFieldState
> {
  public static override get defaultProps(): Omit<ICheckboxTreeFieldProps, 'label' | 'items' | 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
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
        value={this.value}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
