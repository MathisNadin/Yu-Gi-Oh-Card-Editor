import { FormEvent } from 'react';
import { IContainableProps, IContainableState, Containable } from '../containable';

interface ITextInputProps extends IContainableProps {
  placeholder?: string;
  defaultValue: string;
  minLength?: number;
  maxLength?: number;
  onChange: (value: string) => void | Promise<void>;
}

interface ITextInputState extends IContainableState {
  value: string;
}

export class TextInput extends Containable<ITextInputProps, ITextInputState> {
  public static get defaultProps() {
    return { ...super.defaultProps };
  }

  public constructor(props: ITextInputProps) {
    super(props);
    this.state = { ...(this.state || {}), value: props.defaultValue };
  }

  public componentWillReceiveProps(nextProps: Readonly<ITextInputProps>) {
    if (nextProps.defaultValue?.trim() !== this.state.value?.trim()) {
      this.setState({ value: nextProps.defaultValue });
    }
  }

  public render() {
    return this.renderAttributes(
      <input
        type='text'
        name={this.props.name}
        disabled={this.props.disabled}
        placeholder={this.props.placeholder}
        value={this.state.value}
        minLength={this.props.minLength}
        maxLength={this.props.maxLength}
        onInput={(e) => this.onChange(e)}
      />,
      'mn-text-input'
    );
  }

  private onChange(e: FormEvent<HTMLInputElement>) {
    const value = e.target.value as string;
    this.setState(
      { value },
      () => !!this.props.onChange && app.$errorManager.handlePromise(this.props.onChange(this.state.value))
    );
  }
}
