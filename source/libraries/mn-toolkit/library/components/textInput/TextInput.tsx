import { HTMLInputTypeAttribute } from 'react';
import { IContainableProps, IContainableState, Containable, TDidUpdateSnapshot } from '../containable';

export interface ITextInputSpecificProps {
  inputType?: HTMLInputTypeAttribute;
  placeholder?: string;
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
  onChange?: (value: string) => void | Promise<void>;
}

export interface ITextInputProps extends IContainableProps<HTMLInputElement>, ITextInputSpecificProps {}

interface ITextInputState extends IContainableState {
  value: string;
}

export class TextInput extends Containable<ITextInputProps, ITextInputState, HTMLInputElement> {
  public static override get defaultProps(): ITextInputProps {
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

  public override componentDidUpdate(
    prevProps: Readonly<ITextInputProps>,
    prevState: Readonly<ITextInputState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    if (this.props.defaultValue?.trim() !== this.state.value?.trim()) {
      this.setState({ value: this.props.defaultValue! });
    }
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
        type={this.props.inputType}
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

  private async onChange(e: React.FormEvent<HTMLInputElement>) {
    const value = e.target.value as string;
    await this.setStateAsync({ value });
    if (this.props.onChange) await this.props.onChange(value);
  }
}
