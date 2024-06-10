import { FormEvent, HTMLInputTypeAttribute } from 'react';
import { IContainableProps, IContainableState, Containable } from '../containable';

export interface ITextInputProps extends IContainableProps {
  inputType?: HTMLInputTypeAttribute;
  placeholder?: string;
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
  onChange?: (value: string) => void | Promise<void>;
}

interface ITextInputState extends IContainableState {
  value: string;
}

export class TextInput extends Containable<ITextInputProps, ITextInputState> {
  private inputElement!: HTMLInputElement;

  public static get defaultProps(): ITextInputProps {
    return {
      ...super.defaultProps,
      inputType: 'text',
      defaultValue: '',
    };
  }

  public constructor(props: ITextInputProps) {
    super(props);
    this.state = { ...this.state, value: props.defaultValue! };
  }

  public componentDidUpdate(prevProps: ITextInputProps) {
    if (prevProps !== this.props && this.props.defaultValue?.trim() !== this.state.value?.trim()) {
      this.setState({ value: this.props.defaultValue! });
    }
  }

  public doFocus() {
    if (this.inputElement) this.inputElement.focus();
  }

  private onDomInput(c: HTMLInputElement | null) {
    if (!c || this.inputElement) return;
    this.inputElement = c;
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-text-input'] = true;
    return classes;
  }

  public render() {
    return (
      <input
        {...this.renderAttributes()}
        ref={(ref) => this.onDomInput(ref)}
        type={this.props.inputType}
        name={this.props.name}
        disabled={this.props.disabled}
        placeholder={this.props.placeholder}
        value={this.state.value}
        minLength={this.props.minLength}
        maxLength={this.props.maxLength}
        onChange={(e) => app.$errorManager.handlePromise(this.onChange(e))}
        onKeyUp={(e) => this.props.onKeyUp && app.$errorManager.handlePromise(this.props.onKeyUp(e))}
        onKeyDown={(e) => this.props.onKeyDown && app.$errorManager.handlePromise(this.props.onKeyDown(e))}
        onBlur={(e) => this.props.onBlur && app.$errorManager.handlePromise(this.props.onBlur(e))}
        onFocus={(e) => this.props.onFocus && app.$errorManager.handlePromise(this.props.onFocus(e))}
      />
    );
  }

  private async onChange(e: FormEvent<HTMLInputElement>) {
    const value = e.target.value as string;
    await this.setStateAsync({ value });
    if (!this.props.onChange) return;
    await this.props.onChange(value);
  }
}
