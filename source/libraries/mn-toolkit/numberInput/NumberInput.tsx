import { IContainableProps, IContainableState, Containable } from '../containable';
import { integer } from 'libraries/mn-tools';
import { FormEvent } from 'react';

interface INumberInputProps extends IContainableProps {
  autofocus?: boolean;
  placeholder?: string;
  defaultValue: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void | Promise<void>;
}

interface INumberInputState extends IContainableState {
  value: number;
  focus: boolean;
}

export class NumberInput extends Containable<INumberInputProps, INumberInputState> {
  private inputElement!: HTMLInputElement;

  public static get defaultProps() {
    return {
      ...super.defaultProps,
      defaultValue: 0,
      autofocus: false,
    };
  }

  public constructor(props: INumberInputProps) {
    super(props);
    this.state = { ...this.state, value: props.defaultValue };
  }

  public componentDidUpdate() {
    if (this.props.defaultValue !== this.state.value) {
      this.setState({ value: this.props.defaultValue });
    }
  }

  public componentDidMount() {
    if (this.props.autofocus && !app.$device.isNative) {
      setTimeout(() => {
        this.inputElement.focus();
      }, 100);
    }
  }

  public onDomInput(c: HTMLInputElement) {
    if (this.inputElement || !c) return;
    this.inputElement = c;
    this.forceUpdate();
  }

  public render() {
    return this.renderAttributes(
      <input
        type='number'
        ref={(c) => !!c && this.onDomInput(c)}
        name={this.props.name}
        disabled={this.props.disabled}
        placeholder={this.props.placeholder}
        value={this.state.value}
        onBlur={() => this.onBlur()}
        onFocus={() => this.onFocus()}
        onChange={(e) => this.onChange(e)}
        min={this.props.min}
        max={this.props.max}
      />,
      'mn-number-input'
    );
  }

  protected onBlur() {
    this.setState({ focus: false });
  }

  protected onFocus() {
    this.setState({ focus: true });
  }

  private onChange(e: FormEvent<HTMLInputElement>) {
    if (!e.target) return;
    let value = integer(e.target.value);
    if (this.props.max && this.props.max < value) {
      value = this.props.max;
    } else if (this.props.min && this.props.min > value) {
      value = this.props.min;
    }
    if (!!this.props.onChange) this.props.onChange(value);
    this.setState({ value });
  }
}
