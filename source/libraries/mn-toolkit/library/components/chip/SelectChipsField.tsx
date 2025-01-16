import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { SelectChips, ISelectChipsProps } from './SelectChips';

interface ISelectChipsFieldProps<ID = number> extends IFormFieldProps<ID[]>, ISelectChipsProps<ID> {}

interface ISelectChipsFieldState<ID> extends IFormFieldState<ID[]> {}

export class SelectChipsField<ID = number> extends FormField<
  ID[],
  ISelectChipsFieldProps<ID>,
  ISelectChipsFieldState<ID>
> {
  public static override get defaultProps(): ISelectChipsFieldProps {
    return {
      ...super.defaultProps,
      defaultValue: [],
      items: [],
    };
  }

  public constructor(props: ISelectChipsFieldProps<ID>) {
    super(props, 'select-chips');
  }

  protected override renderControl() {
    return (
      <SelectChips<ID>
        disabled={this.props.disabled}
        placeholder={this.props.placeholder}
        defaultValue={this.props.defaultValue}
        items={this.props.items}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
