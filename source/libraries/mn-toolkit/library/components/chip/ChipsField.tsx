import { TSpacingSize } from '../containable';
import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { Chips, IChipsProps } from './Chips';

interface IChipsFieldProps<ID = number> extends IFormFieldProps<ID[]>, IChipsProps<ID> {
  chipsGutter?: TSpacingSize;
}

interface IChipsFieldState extends IFormFieldState {}

export class ChipsField<ID = number> extends FormField<ID[], IChipsFieldProps<ID>, IChipsFieldState> {
  public static override get defaultProps(): Omit<
    IChipsFieldProps,
    'label' | 'items' | 'value' | 'onChange' | 'fieldId' | 'fieldName'
  > {
    return {
      ...super.defaultProps,
    };
  }

  public constructor(props: IChipsFieldProps<ID>) {
    super(props, 'chips');
  }

  protected override renderControl() {
    return (
      <Chips<ID>
        disabled={this.props.disabled}
        id={this.props.fieldId}
        name={this.props.fieldName}
        gutter={this.props.chipsGutter}
        multiple={this.props.multiple}
        items={this.props.items}
        value={this.value}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
