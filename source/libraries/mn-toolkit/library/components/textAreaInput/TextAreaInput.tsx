import { FormEvent, HTMLAttributes, HTMLInputAutoCompleteAttribute } from 'react';
import { IDeviceListener, IScreenSpec } from '../../system';
import { IContainableProps, Containable, IContainableState, TDidUpdateSnapshot } from '../containable';
import { classNames, integer, isDefined, isUndefined } from 'mn-tools';

export interface ITextAreaInputProps extends IContainableProps {
  minRows?: number;
  maxRows?: number;
  autoGrow?: boolean;
  autofocus?: boolean;
  autoComplete?: HTMLInputAutoCompleteAttribute;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  inputId?: string;
  inputName?: string;
  placeholder?: string;
  spellCheck?: boolean;
  value: string;
  onChange: (value: string) => void | Promise<void>;
  onRef?: (ref: HTMLTextAreaElement) => void;
  onFocusTextarea?: (event: React.FocusEvent<HTMLTextAreaElement>) => void | Promise<void>;
  onBlurTextarea?: (event: React.FocusEvent<HTMLTextAreaElement>) => void | Promise<void>;
}

interface ITextAreaInputState extends IContainableState {
  rows?: number;
  activateScroll: boolean;
  hasRetriedUndefinedRows?: boolean;
}

export class TextAreaInput
  extends Containable<ITextAreaInputProps, ITextAreaInputState>
  implements Partial<IDeviceListener>
{
  public inputElement?: HTMLTextAreaElement;
  private hiddenInputElement?: HTMLTextAreaElement;
  private lineHeight = 0;
  private paddingTop = 0;
  private paddingBottom = 0;
  private borderTopWidth = 0;
  private borderBottomWidth = 0;

  public static override get defaultProps(): Omit<ITextAreaInputProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      minRows: 5,
      maxRows: 10,
      autoGrow: false,
      spellCheck: true,
    };
  }

  public constructor(props: ITextAreaInputProps) {
    super(props);
    this.state = {
      ...this.state,
      rows: props.autoGrow ? 1 : props.minRows!,
      activateScroll: !props.autoGrow,
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    app.$device.addListener(this);
    this.setupStyle();
    if (!this.props.autofocus || app.$device.isNative) return;
    setTimeout(() => !!this.inputElement && this.inputElement.focus(), 100);
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    app.$device.removeListener(this);
  }

  public deviceScreenSpecificationChanged(_newSpec: IScreenSpec, _oldSpec: IScreenSpec, _screenSizeChanged: boolean) {
    if (isUndefined(this.state.rows)) return;
    app.$errorManager.handlePromise(this.onTextAreaChange());
  }

  public override componentDidUpdate(
    prevProps: Readonly<ITextAreaInputProps>,
    prevState: Readonly<ITextAreaInputState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (
      prevProps.value !== this.props.value ||
      prevProps.autoGrow !== this.props.autoGrow ||
      prevProps.minRows !== this.props.minRows ||
      prevProps.maxRows !== this.props.maxRows
    ) {
      this.onTextAreaChange();
    }
    // If for one reason or another (ex. Tabs) the TextArea was in the DOM but with a display none then rows was negative, thus undefined
    // If it is refreshed, check the rows again, but only once
    else if (
      this.inputElement &&
      isUndefined(this.state.rows) &&
      this.inputElement.offsetParent !== null && // visible in the flow
      !this.state.hasRetriedUndefinedRows
    ) {
      this.setState({ hasRetriedUndefinedRows: true }, () => {
        this.onTextAreaChange();
      });
    }
  }

  private setupStyle() {
    if (!this.inputElement || !this.hiddenInputElement) return;
    const hiddenInputStyle = getComputedStyle(this.hiddenInputElement);
    this.lineHeight = integer(hiddenInputStyle.lineHeight);
    this.paddingTop = integer(hiddenInputStyle.paddingTop);
    this.paddingBottom = integer(hiddenInputStyle.paddingBottom);
    this.borderTopWidth = integer(hiddenInputStyle.borderTopWidth);
    this.borderBottomWidth = integer(hiddenInputStyle.borderBottomWidth);
    app.$errorManager.handlePromise(this.onTextAreaChange());
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-textarea-input-container'] = true;
    return classes;
  }

  public override get children() {
    return [
      <textarea
        key='input'
        ref={(c) => this.onDomInput(c!)}
        className={classNames('mn-textarea-input', this.props.className)}
        id={this.props.inputId}
        name={this.props.inputName}
        inputMode={this.props.inputMode}
        autoComplete={this.props.autoComplete}
        spellCheck={this.props.spellCheck}
        disabled={this.props.disabled}
        rows={this.state.rows}
        placeholder={this.props.placeholder}
        value={this.props.value}
        onChange={() => {}} // Not used here but necessary for React
        onBlur={(e) => this.props.onBlurTextarea && app.$errorManager.handlePromise(this.props.onBlurTextarea(e))}
        onFocus={(e) => this.props.onFocusTextarea && app.$errorManager.handlePromise(this.props.onFocusTextarea(e))}
        onInput={(e) => app.$errorManager.handlePromise(this.onChange(e))}
        onKeyUp={(e) => app.$errorManager.handlePromise(this.onChange(e))}
        /**
         * Prevents scrolling while the number of max rows has not been reached
         * Useful when a higher font/lineHeight than normal is forced
         */
        style={{ overflowY: this.state.activateScroll ? undefined : 'hidden' }}
      />,

      <textarea
        key='hidden-input'
        ref={(c) => this.hiddenOnDomInput(c!)}
        className={classNames('mn-textarea-input', this.props.className, 'mn-textarea-input-hidden')}
        disabled={this.props.disabled}
        rows={this.state.rows}
        placeholder={this.props.placeholder}
        value={this.props.value}
        style={{ overflowY: this.state.activateScroll ? undefined : 'hidden' }}
        onChange={() => {}} // Useless but must stay for React
        tabIndex={-1}
        aria-hidden='true'
      />,
    ];
  }

  private onDomInput(c: HTMLTextAreaElement) {
    if (!c || this.inputElement) return;
    this.inputElement = c;
    if (this.props.onRef) this.props.onRef(this.inputElement);
  }

  private hiddenOnDomInput(c: HTMLTextAreaElement) {
    if (!c || this.hiddenInputElement) return;
    this.hiddenInputElement = c;
  }

  private async onChange(e: FormEvent<HTMLTextAreaElement>) {
    const value = (e.target as HTMLTextAreaElement).value || '';
    if (value === this.props.value) return;
    await this.props.onChange(value);
    // onTextAreaChange will be called by componentDidUpdate to update size
  }

  private onTextAreaChange() {
    if (!this.props.autoGrow || !this.inputElement || !this.hiddenInputElement) return;

    this.hiddenInputElement.value = this.inputElement.value; // Synchronize text with the invisible textarea
    this.hiddenInputElement.rows = 1;

    // Make sure box-sizing is taken into account
    const innerHeight =
      this.hiddenInputElement.scrollHeight -
      this.paddingTop -
      this.paddingBottom -
      this.borderTopWidth -
      this.borderBottomWidth;

    // Use innerHeight to calculate lines
    const currentRows = Math.round(innerHeight / this.lineHeight);

    let rows: number | undefined;
    let activateScroll: boolean;

    if (currentRows > this.props.maxRows!) {
      rows = this.props.maxRows!;
      activateScroll = true;
    } else if (currentRows > 0) {
      rows = currentRows;
      activateScroll = false;
    } else {
      rows = undefined;
      activateScroll = false;
    }

    // Maximum security to prevent useless updates and potential loops
    const hasRetriedUndefinedRows = isDefined(rows) ? true : false;
    if (
      rows !== this.state.rows ||
      activateScroll !== this.state.activateScroll ||
      hasRetriedUndefinedRows !== this.state.hasRetriedUndefinedRows
    ) {
      this.setState({ rows, activateScroll, hasRetriedUndefinedRows });
    }
  }
}
