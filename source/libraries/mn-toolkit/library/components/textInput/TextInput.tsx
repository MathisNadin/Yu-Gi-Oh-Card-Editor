import { HTMLInputTypeAttribute } from 'react';
import { IContainableProps, IContainableState, Containable } from '../containable';

export interface ITextInputSpecificProps {
  spellCheck: boolean;
  inputType?: HTMLInputTypeAttribute;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  value: string;
  onChange: (value: string) => void | Promise<void>;
}

export interface ITextInputProps extends IContainableProps<HTMLInputElement>, ITextInputSpecificProps {}

interface ITextInputState extends IContainableState {}

export class TextInput extends Containable<ITextInputProps, ITextInputState, HTMLInputElement> {
  public static override get defaultProps(): Omit<ITextInputProps, 'label' | 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      spellCheck: true,
      inputType: 'text',
    };
  }

  public doFocus() {
    if (this.base.current) this.base.current.focus();
  }

  public doBlur() {
    if (this.base.current) this.base.current.blur();
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-text-input'] = true;
    return classes;
  }

  public override render() {
    return (
      <input
        {...this.renderAttributes()}
        ref={this.base}
        spellCheck={this.props.spellCheck}
        type={this.props.inputType}
        disabled={this.props.disabled}
        minLength={this.props.minLength}
        maxLength={this.props.maxLength}
        placeholder={this.props.placeholder}
        value={this.props.value}
        onChange={(e) => app.$errorManager.handlePromise(this.onChange(e))}
        onKeyUp={(e) => this.props.onKeyUp && app.$errorManager.handlePromise(this.props.onKeyUp(e))}
        onKeyDown={(e) => this.props.onKeyDown && app.$errorManager.handlePromise(this.props.onKeyDown(e))}
        onBlur={(e) => this.props.onBlur && app.$errorManager.handlePromise(this.props.onBlur(e))}
        onFocus={(e) => this.props.onFocus && app.$errorManager.handlePromise(this.props.onFocus(e))}
      />
    );
  }

  private async onChange(e: React.FormEvent<HTMLInputElement>) {
    const value = (e.target as HTMLInputElement).value || '';
    await this.props.onChange(value);
  }
}
