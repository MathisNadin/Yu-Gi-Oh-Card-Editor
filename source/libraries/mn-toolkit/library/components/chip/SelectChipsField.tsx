import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { SelectChips, ISelectChipsProps } from './SelectChips';

interface ISelectChipsFieldProps<ID = number> extends IFormFieldProps<ID[]>, ISelectChipsProps<ID> {}

interface ISelectChipsFieldState extends IFormFieldState {}

export class SelectChipsField<ID = number> extends FormField<ID[], ISelectChipsFieldProps<ID>, ISelectChipsFieldState> {
  public static override get defaultProps(): Omit<
    ISelectChipsFieldProps,
    'label' | 'items' | 'value' | 'onChange' | 'fieldId' | 'fieldName'
  > {
    return {
      ...super.defaultProps,
    };
  }

  public constructor(props: ISelectChipsFieldProps<ID>) {
    super(props, 'select-chips');
  }

  protected override renderControl() {
    return (
      <SelectChips<ID>
        disabled={this.props.disabled}
        id={this.props.fieldId}
        name={this.props.fieldName}
        placeholder={this.props.placeholder}
        items={this.props.items}
        value={this.props.value}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
