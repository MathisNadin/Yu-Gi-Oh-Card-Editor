import { createRef } from 'react';
import { FormField, IFormFieldProps, IFormFieldState, TFormField } from '../form';
import { ITextInputSpecificProps, TextInput } from './TextInput';

export interface ITextInputFieldProps extends IFormFieldProps<string>, ITextInputSpecificProps {
  onSubmit?: (event: React.KeyboardEvent<HTMLInputElement>) => void | Promise<void>;
}

export interface ITextInputFieldState extends IFormFieldState {}

export class TextInputField<PROPS extends ITextInputFieldProps, STATE extends ITextInputFieldState> extends FormField<
  string,
  PROPS,
  STATE
> {
  protected inputElement = createRef<TextInput>();

  public static override get defaultProps(): Omit<ITextInputFieldProps, 'label' | 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      spellCheck: TextInput.defaultProps.spellCheck,
      inputType: TextInput.defaultProps.inputType,
    };
  }

  public constructor(props: PROPS, type: string = 'text') {
    super(props, type);
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
      <TextInput
        ref={this.inputElement}
        name={this.props.name}
        spellCheck={this.props.spellCheck}
        inputType={this.props.inputType!}
        disabled={this.props.disabled}
        placeholder={this.props.placeholder}
        minLength={this.props.minLength}
        maxLength={this.props.maxLength}
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
