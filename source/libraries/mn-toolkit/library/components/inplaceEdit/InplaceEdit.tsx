import { RefObject } from 'react';
import { IContainableProps, IContainableState, Containable, TDidUpdateSnapshot } from '../containable';
import { Icon } from '../icon';

interface InplaceEditProps extends IContainableProps<HTMLInputElement | HTMLDivElement> {
  validateOnEnter?: boolean;
  placeholder?: string;
  defaultValue?: string;
  onChange?: (value: string, fromBlur: boolean) => void | Promise<void>;
}

interface InplaceEditState extends IContainableState {
  value: string;
  isFocused: boolean;
}

export class InplaceEdit extends Containable<InplaceEditProps, InplaceEditState, HTMLInputElement | HTMLDivElement> {
  public static override get defaultProps(): InplaceEditProps {
    return {
      ...super.defaultProps,
      validateOnEnter: true,
      placeholder: 'Cliquez pour modifier...',
      defaultValue: '',
    };
  }

  public constructor(props: InplaceEditProps) {
    super(props);
    this.state = {
      ...this.state,
      isFocused: false,
      value: props.defaultValue!,
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<InplaceEditProps>,
    prevState: Readonly<InplaceEditState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    const doFocus = () =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!this.base.current || !(this.base.current instanceof HTMLInputElement) || !this.state.isFocused) return;
          this.base.current.focus();
        })
      );
    if (prevProps !== this.props && this.state.value !== this.props.defaultValue) {
      this.setState({ value: this.props.defaultValue! }, doFocus);
    } else {
      doFocus();
    }
  }

  private async onKeyDown(e: React.KeyboardEvent) {
    if (!this.props.validateOnEnter || e.key !== 'Enter') return;
    await this.doBlur();
  }

  private async doBlur() {
    await this.setStateAsync({ isFocused: false });
    if (this.props.onChange) await this.props.onChange(this.state.value, true);
  }

  private async onChange(e: React.FormEvent<HTMLInputElement>) {
    const value = (e.target.value as string) || '';
    await this.setStateAsync({ value });
    if (this.props.onChange) await this.props.onChange(this.state.value, false);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-inplace-edit'] = true;
    classes['with-placeholder'] = !this.state.value;
    return classes;
  }

  public override render() {
    if (this.state.isFocused) {
      return (
        <input
          {...this.renderAttributes()}
          ref={this.base as RefObject<HTMLInputElement>}
          type='text'
          name={this.props.name}
          disabled={this.props.disabled}
          placeholder={this.props.placeholder}
          value={this.state.value}
          onChange={(e) => app.$errorManager.handlePromise(this.onChange(e))}
          onKeyUp={(e) => this.props.onKeyUp && app.$errorManager.handlePromise(this.props.onKeyUp(e))}
          onKeyDown={(e) => app.$errorManager.handlePromise(this.onKeyDown(e))}
          onBlur={() => app.$errorManager.handlePromise(this.doBlur())}
          onFocus={(e) => this.props.onFocus && app.$errorManager.handlePromise(this.props.onFocus(e))}
        />
      );
    } else {
      return (
        <div
          {...this.renderAttributes()}
          ref={this.base as RefObject<HTMLDivElement>}
          onClick={() => this.setState({ isFocused: true })}
        >
          <div className='value'>{this.state.value || this.props.placeholder}</div>
          <Icon color='2' icon='toolkit-pen' />
        </div>
      );
    }
  }
}
