import { ISelectProps, Select } from './Select';
import { FormField, IFormFieldProps, IFormFieldState } from '../form';

interface ISelectFieldProps<ID = number> extends IFormFieldProps<ID>, Omit<ISelectProps<ID>, 'width' | 'minWidth'> {}

interface ISelectFieldState extends IFormFieldState {}

export class SelectField<ID = number> extends FormField<ID, ISelectFieldProps<ID>, ISelectFieldState> {
  public static override get defaultProps(): Omit<
    ISelectFieldProps,
    'label' | 'items' | 'value' | 'onChange' | 'fieldId' | 'fieldName'
  > {
    return {
      ...super.defaultProps,
      labelDecorator: Select.defaultProps.labelDecorator,
    };
  }

  public constructor(props: ISelectFieldProps<ID>) {
    super(props, 'select');
  }

  protected override renderControl() {
    return (
      <Select<ID>
        disabled={this.props.disabled}
        id={this.props.fieldId}
        name={this.props.fieldName}
        items={this.props.items}
        value={this.value}
        onChange={(value) => this.onChange(value)}
        sort={this.props.sort}
        noTopContainer={this.props.noTopContainer}
        maxVisibleItems={this.props.maxVisibleItems}
        undefinedLabel={this.props.required ? 'Choisissez une valeur' : ''}
        labelDecorator={this.props.labelDecorator}
      />
    );
  }
}
