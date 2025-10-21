import { RefObject } from 'react';
import { IContainableProps, IContainableState, Containable, TDidUpdateSnapshot } from '../containable';
import { Icon } from '../icon';

interface InplaceEditProps extends IContainableProps<HTMLInputElement | HTMLDivElement> {
  validateOnEnter?: boolean;
  idlePlaceholder?: string;
  inputPlaceholder?: string;
  value: string;
  onChange: (value: string) => void | Promise<void>;
}

interface InplaceEditState extends IContainableState {
  isFocused?: boolean;
}

export class InplaceEdit extends Containable<InplaceEditProps, InplaceEditState, HTMLInputElement | HTMLDivElement> {
  public static override get defaultProps(): Omit<InplaceEditProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      validateOnEnter: true,
      idlePlaceholder: 'Cliquez pour modifier...',
      inputPlaceholder: 'Érivez ici...',
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<InplaceEditProps>,
    prevState: Readonly<InplaceEditState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (this.state.isFocused && !prevState.isFocused && this.base.current instanceof HTMLInputElement) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!this.base.current || !(this.base.current instanceof HTMLInputElement) || !this.state.isFocused) return;
          this.base.current.focus();
        })
      );
    }
  }

  private async onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!this.props.validateOnEnter || e.key !== 'Enter') return;
    if (this.base.current instanceof HTMLInputElement) {
      this.base.current.blur();
    }
  }

  private async onBlur(e: React.FocusEvent<HTMLInputElement>) {
    await this.setStateAsync({ isFocused: false });
    if (this.props.onBlur) await this.props.onBlur(e);
  }

  private async onChange(e: React.FormEvent<HTMLInputElement>) {
    const value = (e.target as HTMLInputElement).value || '';
    await this.props.onChange(value);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-inplace-edit'] = true;
    classes['with-placeholder'] = !this.props.value;
    return classes;
  }

  public override render() {
    if (this.state.isFocused) {
      return (
        <input
          {...this.renderAttributes()}
          ref={this.base as RefObject<HTMLInputElement>}
          type='text'
          disabled={this.props.disabled}
          placeholder={this.props.inputPlaceholder}
          value={this.props.value}
          onChange={(e) => app.$errorManager.handlePromise(this.onChange(e))}
          onKeyUp={(e) => this.props.onKeyUp && app.$errorManager.handlePromise(this.props.onKeyUp(e))}
          onKeyDown={(e) => app.$errorManager.handlePromise(this.onKeyDown(e))}
          onBlur={(e) => app.$errorManager.handlePromise(this.onBlur(e))}
        />
      );
    } else {
      return (
        <div
          {...this.renderAttributes()}
          ref={this.base as RefObject<HTMLDivElement>}
          onClick={() => this.setState({ isFocused: true })}
        >
          <div className='value'>{this.props.value || this.props.idlePlaceholder}</div>
          <Icon color='2' icon='toolkit-pen' />
        </div>
      );
    }
  }
}
