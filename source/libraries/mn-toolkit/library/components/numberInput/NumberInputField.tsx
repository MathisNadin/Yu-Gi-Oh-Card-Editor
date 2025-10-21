import { createRef } from 'react';
import { isNumber } from 'mn-tools';
import { FormField, IFormFieldProps, IFormFieldState, TFormField } from '../form';
import { INumberInputSpecificProps, NumberInput } from './NumberInput';

export interface INumberInputFieldProps extends IFormFieldProps<number | undefined>, INumberInputSpecificProps {
  onSubmit?: (event: React.KeyboardEvent<HTMLInputElement>) => void | Promise<void>;
}

export interface INumberInputFieldState extends IFormFieldState {}

export class NumberInputField extends FormField<number | undefined, INumberInputFieldProps, INumberInputFieldState> {
  protected inputElement = createRef<NumberInput>();

  public static override get defaultProps(): Omit<
    INumberInputFieldProps,
    'label' | 'value' | 'onChange' | 'fieldId' | 'fieldName'
  > {
    return {
      ...super.defaultProps,
    };
  }

  public constructor(props: INumberInputFieldProps) {
    super(props, 'number');
    this.validators.unshift(async (field) => {
      if (!isNumber(field.value)) {
        await field.addError("Ceci n'est pas un nombre");
      }
    });
  }

  public override get hasValue() {
    return isNumber(this.value);
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
        id={this.props.fieldId}
        name={this.props.fieldName}
        disabled={this.props.disabled}
        autofocus={this.props.autofocus}
        placeholder={this.props.placeholder}
        min={this.props.min}
        max={this.props.max}
        value={this.value}
        onChange={(value) => this.onChange(value)}
        onKeyDown={(e) => this.onKeyDown(e)}
        onBlur={() => this.onBlur()}
        onFocus={() => this.onFocus()}
      />
    );
  }

  protected onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    (e.target as HTMLInputElement).blur();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (!this.hasValue) return;
        if (this.context?.notifyFieldSubmit) this.context.notifyFieldSubmit(this as unknown as TFormField);
        if (this.props.onSubmit) app.$errorManager.handlePromise(this.props.onSubmit(e));
      })
    );
  }
}
