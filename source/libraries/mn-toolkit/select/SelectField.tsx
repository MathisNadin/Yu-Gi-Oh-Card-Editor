import { isEmpty } from 'mn-tools';
import { ISelectItem, ISelectProps, Select } from './Select';
import { FormField, IFormFieldProps, IFormFieldState } from '../form';

interface ISelectFieldProps<ID = number> extends IFormFieldProps<ID>, Omit<ISelectProps<ID>, 'width' | 'minWidth'> {
  items: ISelectItem<ID>[];
  sort?: boolean;
}

interface ISelectFieldState<ID> extends IFormFieldState<ID> {}

export class SelectField<ID = number> extends FormField<ID, ISelectFieldProps<ID>, ISelectFieldState<ID>> {
  private selectComponent!: Select<ID>;

  public static get defaultProps(): ISelectFieldProps {
    return {
      ...super.defaultProps,
      items: [],
    };
  }

  public constructor(props: ISelectFieldProps<ID>) {
    super(props, 'select');
    this.state = {
      ...this.state,
      value: props.defaultValue!,
    };

    if (props.required) {
      this.validators.unshift((field) => {
        if (isEmpty((field as SelectField<ID>).value)) {
          return field.addError('Nous avons besoin de quelque chose ici');
        }
        field.validate();
      });
    }
  }

  public componentDidUpdate(prevProps: ISelectFieldProps<ID>) {
    if (prevProps === this.props) return;
    if (this.props.defaultValue !== this.state.value) {
      this.setState({ value: this.props.defaultValue! });
    }
  }

  public get hasValue() {
    return true;
  }

  protected async onChange(value: ID) {
    await this.setStateAsync({ value });
    this.fireValueChanged();
    if (!!this.props.onChange) this.props.onChange(value);
  }

  protected renderControl() {
    return (
      <Select<ID>
        ref={(c) => {
          if (c) this.selectComponent = c;
        }}
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

  protected doClickItem(e: React.MouseEvent) {
    if (this.selectComponent) this.selectComponent.showListItems(e);
  }
}
