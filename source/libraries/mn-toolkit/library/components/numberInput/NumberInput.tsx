import { integer } from 'mn-tools';
import { IContainableProps, IContainableState, Containable, TDidUpdateSnapshot } from '../containable';

export interface INumberInputSpecificProps {
  autofocus?: boolean;
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void | Promise<void>;
}

export interface INumberInputProps extends IContainableProps<HTMLInputElement>, INumberInputSpecificProps {}

interface INumberInputState extends IContainableState {
  value: number;
  focus: boolean;
}

export class NumberInput extends Containable<INumberInputProps, INumberInputState, HTMLInputElement> {
  public static get defaultProps(): INumberInputProps {
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

  public override componentDidUpdate(
    prevProps: Readonly<INumberInputProps>,
    prevState: Readonly<INumberInputState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    if (this.props.defaultValue !== this.state.value) {
      this.setState({ value: this.props.defaultValue! });
    }
  }

  public override componentDidMount() {
    super.componentDidMount();
    if (this.props.autofocus && !app.$device.isNative) {
      setTimeout(() => {
        if (this.base.current) this.base.current.focus();
      }, 100);
    }
  }

  public doFocus() {
    if (this.base.current) this.base.current.focus();
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-number-input'] = true;
    return classes;
  }

  public override render() {
    return (
      <input
        {...this.renderAttributes()}
        type='number'
        ref={this.base}
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

  protected async onBlur(e: React.FocusEvent<HTMLInputElement>) {
    await this.setStateAsync({ focus: false });
    if (this.props.onBlur) await this.props.onBlur(e);
  }

  protected async onFocus(e: React.FocusEvent<HTMLInputElement>) {
    await this.setStateAsync({ focus: true });
    if (this.props.onFocus) await this.props.onFocus(e);
  }

  private async onChange(e: React.FormEvent<HTMLInputElement>) {
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
