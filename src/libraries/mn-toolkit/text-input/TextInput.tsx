import './styles.scss';
import { FormEvent } from "react";
import { IContainableProps, IContainableState, Containable } from "../containable/Containable";

interface ITextInputProps extends IContainableProps {
  placeholder?: string;
  defaultValue: string;
  onChange: (value: string) => void | Promise<void>;
}

interface ITextInputState extends IContainableState {
  value: string;
}

export class TextInput extends Containable<ITextInputProps, ITextInputState> {

  public static get defaultProps() { return { ...super.defaultProps }; }

  public constructor(props: ITextInputProps) {
    super(props);
    this.setState({ value: props.defaultValue });
  }

  public componentWillReceiveProps(nextProps: Readonly<ITextInputProps>) {
    if (nextProps.defaultValue?.trim() !== this.state.value?.trim()) {
      this.setState({ value: nextProps.defaultValue });
    }
  }

  public render() {
    return this.renderAttributes(
      <input type="text"
        name={this.props.name}
        disabled={this.props.disabled}
        placeholder={this.props.placeholder}
        value={this.state.value}
        onInput={e => this.onChange(e)}
      />, 'mn-text-input');
  }

  private onChange(e: FormEvent<HTMLInputElement>) {
    const value = e.target.value as string;
    this.setState({ value });
    if (this.props.onChange) app.$errorManager.handlePromise(this.props.onChange(value));
  }
}
