import { isEmpty, isNumber, isUndefined } from 'mn-tools';
import { FormField, IFormFieldProps, IFormFieldState } from '../form/FormField';
import { INumberInputProps, NumberInput } from './NumberInput';
import { createRef } from 'react';

export interface INumberFieldProps extends IFormFieldProps<number>, INumberInputProps {}

export interface INumberFieldState extends IFormFieldState<number> {}

export class NumberField extends FormField<number, INumberFieldProps, INumberFieldState> {
  protected inputElement = createRef<NumberInput>();

  public static get defaultProps(): INumberFieldProps {
    return {
      ...super.defaultProps,
      defaultValue: 0,
    };
  }

  public constructor(props: INumberFieldProps) {
    super(props, 'number');
    this.state = {
      ...this.state,
      value: props.defaultValue!,
    };

    this.validators.unshift((field) => {
      if (!isNumber((field as NumberField).value)) return field.addError("Ceci n'est pas un nombre");
      field.validate();
    });

    if (props.required) {
      this.validators.unshift((field) => {
        if (isEmpty((field as NumberField).value)) {
          return field.addError('Nous avons besoin de quelque chose ici');
        }
        field.validate();
      });
    }
  }

  public get hasValue() {
    return !isUndefined(this.state.value);
  }

  public componentDidMount() {
    if (this.props.autofocus && !app.$device.isNative) {
      setTimeout(() => {
        if (this.inputElement?.current) this.inputElement.current.doFocus();
      }, 100);
    }
  }

  public componentDidUpdate(prevProps: INumberFieldProps) {
    if (prevProps === this.props) return;
    if (this.props.defaultValue !== this.state.value) {
      this.setState({ value: this.props.defaultValue! });
      if (this.validators.length && this.props.required) {
        app.$errorManager.handlePromise(this.doValidation());
      }
    }
  }

  public renderControl() {
    return (
      <NumberInput
        ref={this.inputElement}
        name={this.props.name}
        disabled={this.props.disabled}
        autofocus={this.props.autofocus}
        placeholder={this.props.placeholder}
        min={this.props.min}
        max={this.props.max}
        defaultValue={this.state.value}
        onKeyDown={(e) => this.onKeyDown(e)}
        onBlur={() => this.onBlur()}
        onFocus={() => this.onFocus()}
        onChange={(value) => this.onChange(value)}
      />
    );
  }

  protected async onChange(value: number) {
    await this.setStateAsync({ value });
    this.fireValueChanged();
    if (!!this.props.onChange) this.props.onChange(value);
  }

  protected onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      (e.target as HTMLElement).blur();
      setTimeout(() => {
        if (this.hasValue) this.observers.dispatch('formFieldSubmit', this);
        if (this.props.onSubmit) app.$errorManager.handlePromise(this.props.onSubmit(e));
      });
    }
  }

  public doClickItem(_e: React.MouseEvent) {
    if (this.inputElement?.current) this.inputElement.current.doFocus();
  }
}
