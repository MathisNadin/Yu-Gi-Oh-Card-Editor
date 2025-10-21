import { integer } from 'mn-tools';
import { IContainableProps, IContainableState, Containable } from '../containable';

export interface INumberInputSpecificProps {
  autofocus?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  value: number | undefined;
  onChange: (value: number | undefined) => void | Promise<void>;
}

export interface INumberInputProps extends IContainableProps<HTMLInputElement>, INumberInputSpecificProps {}

interface INumberInputState extends IContainableState {
  focus?: boolean;
}

export class NumberInput extends Containable<INumberInputProps, INumberInputState, HTMLInputElement> {
  public static get defaultProps(): Omit<INumberInputProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      paddingX: 'small',
      autofocus: false,
    };
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
        disabled={this.props.disabled}
        placeholder={this.props.placeholder}
        min={this.props.min}
        max={this.props.max}
        value={this.props.value}
        onChange={(e) => app.$errorManager.handlePromise(this.onChange(e))}
        onKeyDown={(e) => this.props.onKeyDown && app.$errorManager.handlePromise(this.props.onKeyDown(e))}
        onBlur={(e) => app.$errorManager.handlePromise(this.onBlur(e))}
        onFocus={(e) => app.$errorManager.handlePromise(this.onFocus(e))}
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
    let value = integer(e.target.value || '0');
    if (this.props.max && this.props.max < value) {
      value = this.props.max;
    } else if (this.props.min && this.props.min > value) {
      value = this.props.min;
    }
    await this.props.onChange(value);
  }
}
