import { ISelectItem, ISelectProps, Select } from './Select';
import { FormField, IFormFieldProps, IFormFieldState } from '../form';

interface ISelectFieldProps<ID = number> extends IFormFieldProps<ID>, Omit<ISelectProps<ID>, 'width' | 'minWidth'> {
  items: ISelectItem<ID>[];
  sort?: boolean;
}

interface ISelectFieldState<ID> extends IFormFieldState<ID> {}

export class SelectField<ID = number> extends FormField<ID, ISelectFieldProps<ID>, ISelectFieldState<ID>> {
  public static get defaultProps(): ISelectFieldProps {
    return {
      ...super.defaultProps,
      items: [],
    };
  }

  public constructor(props: ISelectFieldProps<ID>) {
    super(props, 'select');
  }

  protected override renderControl() {
    return (
      <Select<ID>
        items={this.props.items}
        defaultValue={this.state.value}
        disabled={this.props.disabled}
        sort={this.props.sort}
        noTopContainer={this.props.noTopContainer}
        maxVisibleItems={this.props.maxVisibleItems}
        undefinedLabel={this.props.required ? 'Choisissez une valeur' : ''}
        labelDecorator={this.props.labelDecorator}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
