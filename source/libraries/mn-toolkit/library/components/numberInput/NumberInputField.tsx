import { createRef } from 'react';
import { isNumber, isUndefined } from 'mn-tools';
import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { INumberInputSpecificProps, NumberInput } from './NumberInput';

export interface INumberInputFieldProps extends IFormFieldProps<number, HTMLInputElement>, INumberInputSpecificProps {}

export interface INumberInputFieldState extends IFormFieldState<number> {}

export class NumberInputField extends FormField<
  number,
  INumberInputFieldProps,
  INumberInputFieldState,
  HTMLInputElement
> {
  protected inputElement = createRef<NumberInput>();

  public static override get defaultProps(): INumberInputFieldProps {
    return {
      ...super.defaultProps,
      defaultValue: 0,
    };
  }

  public constructor(props: INumberInputFieldProps) {
    super(props, 'number');
    this.validators.unshift((field) => {
      if (isNumber(field.value)) field.validate();
      else field.addError("Ceci n'est pas un nombre");
    });
  }

  public override get hasValue() {
    return !isUndefined(this.state.value);
  }

  public override componentDidMount() {
    super.componentDidMount();
    if (!this.props.autofocus || app.$device.isNative) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (this.inputElement.current) this.inputElement.current.doFocus();
      })
    );
  }

  protected override renderControl() {
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

  protected onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    (e.target as HTMLInputElement).blur();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (!this.hasValue) return;
        this.observers.dispatch('formFieldSubmit', this);
        if (this.props.onSubmit) app.$errorManager.handlePromise(this.props.onSubmit(e));
      })
    );
  }
}
