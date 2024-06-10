import { IContainableProps, IContainableState, Containable } from '../containable';
import { IVerticalStackProps, VerticalStack } from '../container';
import { KeyboardEvent, MouseEvent, createRef } from 'react';

interface InplaceEditProps extends IContainableProps {
  value: string;
  focusOnSingleClick?: boolean;
  validateOnEnter?: boolean;
  onChange?: (newValue: string) => void | Promise<void>;
  onSingleClick?: (e: MouseEvent) => void | Promise<void>;
  onDoubleClick?: (e: MouseEvent) => void | Promise<void>;
}

interface InplaceEditState extends IContainableState {
  isFocused: boolean;
}

export class InplaceEdit extends Containable<InplaceEditProps, InplaceEditState> {
  private inputRef = createRef<HTMLInputElement>();
  private clickTimer: ReturnType<typeof setTimeout> | undefined;
  private tempValue: string;

  public constructor(props: InplaceEditProps) {
    super(props);

    this.state = {
      loaded: true,
      isFocused: false,
    };
    this.tempValue = props.value;
  }

  public componentDidUpdate() {
    setTimeout(() => {
      if (this.state.isFocused) this.inputRef.current?.focus();
    }, 100);
  }

  private async doBlur() {
    this.clickTimer = undefined;
    await this.setState({ isFocused: false });
    if (!this.props.onChange) return;
    await this.props.onChange(this.tempValue);
  }

  private doFocus() {
    this.setState({ isFocused: true }, () => {
      if (!this.inputRef.current) return;
      this.inputRef.current.focus();
    });
  }

  private onSingleClick(e: MouseEvent) {
    if (this.clickTimer) return;
    if (this.props.focusOnSingleClick) this.doFocus();
    this.clickTimer = setTimeout(() => {
      if (this.props.onSingleClick) {
        app.$errorManager.handlePromise(this.props.onSingleClick(e));
      }
      this.clickTimer = undefined;
    }, 200);
  }

  private async onDoubleClick(e: MouseEvent) {
    clearTimeout(this.clickTimer);
    if (!this.props.focusOnSingleClick) this.doFocus();
    this.clickTimer = undefined;
    if (!this.props.onDoubleClick) return;
    await this.props.onDoubleClick(e);
  }

  private async onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!this.props.validateOnEnter || e.key !== 'Enter') return;
    await this.doBlur();
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-inplace-edit'] = true;
    return classes;
  }

  public render() {
    return (
      <VerticalStack {...(this.renderAttributes() as IVerticalStackProps)}>
        {this.state.isFocused ? (
          <input
            className='value'
            type='text'
            ref={this.inputRef}
            defaultValue={this.tempValue}
            onChange={(e) => (this.tempValue = e.target.value)}
            onKeyDown={(e) => app.$errorManager.handlePromise(this.onKeyDown(e))}
            onBlur={() => this.doBlur()}
          />
        ) : (
          <div
            className='value'
            onClick={(e) => this.onSingleClick(e)}
            onDoubleClick={(e) => app.$errorManager.handlePromise(this.onDoubleClick(e))}
          >
            {this.tempValue || '<vide>'}
          </div>
        )}
      </VerticalStack>
    );
  }
}
