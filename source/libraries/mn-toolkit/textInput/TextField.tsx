import { isEmpty, isString } from 'mn-tools';
import { FormField, IFormFieldProps, IFormFieldState } from '../form/FormField';
import { ITextInputProps, TextInput } from './TextInput';
import { createRef } from 'react';

export interface ITextFieldProps extends IFormFieldProps<string>, ITextInputProps {}

export interface ITextFieldState extends IFormFieldState<string> {}

export class TextField<PROPS extends ITextFieldProps, STATE extends ITextFieldState> extends FormField<
  string,
  PROPS,
  STATE
> {
  protected inputElement = createRef<TextInput>();

  public static get defaultProps(): ITextFieldProps {
    return {
      ...super.defaultProps,
      inputType: 'text',
      defaultValue: '',
    };
  }

  public constructor(props: PROPS, type?: string) {
    if (!isString(type)) type = 'text';
    super(props, type);
    this.state = {
      ...this.state,
      value: props.defaultValue!,
    };

    if (props.required) {
      this.validators.unshift((field) => {
        if (isEmpty((field as TextField<PROPS, STATE>).value)) {
          return field.addError('Nous avons besoin de quelque chose ici');
        }
        field.validate();
      });
    }
  }

  public componentDidMount() {
    if (!this.props.autofocus || app.$device.isNative) return;
    setTimeout(() => {
      if (this.inputElement.current) this.inputElement.current.doFocus();
    }, 100);
  }

  public componentDidUpdate(prevProps: ITextFieldProps) {
    if (prevProps === this.props || this.props.defaultValue?.trim() === this.state.value?.trim()) return;
    this.setState({ value: this.props.defaultValue! }, () => {
      if (this.validators.length && this.props.required) {
        app.$errorManager.handlePromise(this.doValidation());
      }
    });
  }

  public renderControl() {
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

  protected async onChange(value: string) {
    await this.setStateAsync({ value } as Partial<STATE>);
    this.fireValueChanged();
    if (!this.props.onChange) return;
    this.props.onChange(value);
  }

  protected onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'Enter') return;
    (e.target as HTMLElement).blur();
    setTimeout(() => {
      if (this.hasValue) this.observers.dispatch('formFieldSubmit', this);
      if (this.props.onSubmit) app.$errorManager.handlePromise(this.props.onSubmit(e));
    });
  }

  public doClickItem(_e: React.MouseEvent) {
    if (!this.inputElement.current) return;
    this.inputElement.current.doFocus();
  }
}
