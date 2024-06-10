import { IContainableProps, IContainableState, Containable } from '../containable';
import { integer } from 'mn-tools';
import { FormEvent } from 'react';

export interface INumberInputProps extends IContainableProps {
  autofocus?: boolean;
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void | Promise<void>;
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
    this.state = { ...this.state, value: props.defaultValue! };
  }

  public componentDidUpdate() {
    if (this.props.defaultValue !== this.state.value) {
      this.setState({ value: this.props.defaultValue! });
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

  public doFocus() {
    if (this.inputElement) this.inputElement.focus();
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-number-input'] = true;
    return classes;
  }

  public render() {
    return (
      <input
        {...this.renderAttributes()}
        type='number'
        ref={(c) => !!c && this.onDomInput(c)}
        name={this.props.name}
        disabled={this.props.disabled}
        placeholder={this.props.placeholder}
        value={this.state.value}
        min={this.props.min}
        max={this.props.max}
        onKeyDown={(e) => this.props.onKeyDown && this.props.onKeyDown(e)}
        onBlur={(e) => app.$errorManager.handlePromise(this.onBlur(e))}
        onFocus={(e) => app.$errorManager.handlePromise(this.onFocus(e))}
        onChange={(e) => app.$errorManager.handlePromise(this.onChange(e))}
      />
    );
  }

  protected async onBlur(e: React.FocusEvent) {
    await this.setStateAsync({ focus: false });
    if (!this.props.onBlur) return;
    await this.props.onBlur(e);
  }

  protected async onFocus(e: React.FocusEvent) {
    await this.setStateAsync({ focus: true });
    if (!this.props.onFocus) return;
    await this.props.onFocus(e);
  }

  private async onChange(e: FormEvent<HTMLInputElement>) {
    if (!e.target) return;
    let value = integer(e.target.value);
    if (this.props.max && this.props.max < value) {
      value = this.props.max;
    } else if (this.props.min && this.props.min > value) {
      value = this.props.min;
    }
    await this.setStateAsync({ value });
    if (!this.props.onChange) return;
    await this.props.onChange(value);
  }
}
