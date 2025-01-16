import { createRef } from 'react';
import { isString } from 'mn-tools';
import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { ITextInputSpecificProps, TextInput } from './TextInput';

export interface ITextInputFieldProps extends IFormFieldProps<string, HTMLInputElement>, ITextInputSpecificProps {}

export interface ITextInputFieldState extends IFormFieldState<string> {}

export class TextInputField<PROPS extends ITextInputFieldProps, STATE extends ITextInputFieldState> extends FormField<
  string,
  PROPS,
  STATE,
  HTMLInputElement
> {
  protected inputElement = createRef<TextInput>();

  public static override get defaultProps(): ITextInputFieldProps {
    return {
      ...super.defaultProps,
      inputType: 'text',
      defaultValue: '',
    };
  }

  public constructor(props: PROPS, type?: string) {
    if (!isString(type)) type = 'text';
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
        inputType={this.props.inputType!}
        disabled={this.props.disabled}
        placeholder={this.props.placeholder}
        minLength={this.props.minLength}
        maxLength={this.props.maxLength}
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
