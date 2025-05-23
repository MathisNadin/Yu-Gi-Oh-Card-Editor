import { IDeviceListener, IScreenSpec } from 'mn-toolkit/library/system';
import { IContainableProps, Containable, IContainableState, TDidUpdateSnapshot } from '../containable';
import { classNames, integer, isUndefined } from 'mn-tools';
import { FormEvent } from 'react';

export interface ITextAreaInputProps extends IContainableProps {
  rows?: number;
  minRows?: number;
  maxRows?: number;
  autoGrow?: boolean;
  autofocus?: boolean;
  placeholder?: string;
  defaultValue?: string;
  spellCheck?: boolean;
  onRef?: (ref: HTMLTextAreaElement) => void;
  onChange?: (value: string) => void | Promise<void>;
  onFocusTextarea?: (event: React.FocusEvent<HTMLTextAreaElement>) => void | Promise<void>;
  onBlurTextarea?: (event: React.FocusEvent<HTMLTextAreaElement>) => void | Promise<void>;
}

interface ITextAreaInputState extends IContainableState {
  value: string;
  rows?: number;
  activateScroll: boolean;
}

export class TextAreaInput
  extends Containable<ITextAreaInputProps, ITextAreaInputState>
  implements Partial<IDeviceListener>
{
  public inputElement!: HTMLTextAreaElement;
  private hiddenInputElement!: HTMLTextAreaElement;
  private lineHeight!: number;
  private paddingTop!: number;
  private paddingBottom!: number;
  private borderTopWidth!: number;
  private borderBottomWidth!: number;

  public static override get defaultProps(): ITextAreaInputProps {
    return {
      ...super.defaultProps,
      defaultValue: '',
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
      value: props.defaultValue!,
      activateScroll: !props.autoGrow,
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    app.$device.addListener(this);
    this.setupStyle();
    if (!this.props.autofocus || app.$device.isNative) return;
    setTimeout(() => this.inputElement.focus(), 100);
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
    if (prevProps === this.props) return;
    if (this.props.defaultValue?.trim() !== this.state.value?.trim()) {
      this.setState({ value: this.props.defaultValue! }, () =>
        app.$errorManager.handlePromise(this.onTextAreaChange())
      );
    }
    // If for one reason or another (ex. Tabs) the TextArea was in the DOM byt with a display none then rows was negative, thus undefined
    // If it is refreshed, check the rows again
    else if (isUndefined(this.state.rows)) {
      this.onTextAreaChange();
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
        name={this.props.name}
        spellCheck={this.props.spellCheck}
        disabled={this.props.disabled}
        rows={this.state.rows}
        placeholder={this.props.placeholder}
        value={this.state.value}
        onChange={() => {}}
        onBlur={(e) => this.props.onBlurTextarea && app.$errorManager.handlePromise(this.props.onBlurTextarea(e))}
        onFocus={(e) => this.props.onFocusTextarea && app.$errorManager.handlePromise(this.props.onFocusTextarea(e))}
        onInput={(e) => app.$errorManager.handlePromise(this.onChange(e))}
        onKeyUp={(e) => app.$errorManager.handlePromise(this.onChange(e))}
        // FIXME MN : Un peu bâtard, ça empêche le scroll tant qu'on n'a pas dépassé le nombre de maxRows
        // Utile notamment quand on force une police/lineHeight plus haut qu'à la normale
        style={{ overflowY: this.state.activateScroll ? undefined : 'hidden' }}
      />,

      <textarea
        key='hidden-input'
        ref={(c) => this.hiddenOnDomInput(c!)}
        className={classNames('mn-textarea-input', this.props.className, 'mn-textarea-input-hidden')}
        disabled={this.props.disabled}
        rows={this.state.rows}
        placeholder={this.props.placeholder}
        value={this.state.value}
        style={{ overflowY: this.state.activateScroll ? undefined : 'hidden' }}
        onChange={() => {}}
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

  private async onChange(e: FormEvent) {
    const value = e.target.value as string;
    if (value === this.state.value) return;
    await this.setStateAsync({ value });
    this.onTextAreaChange();
    if (this.props.onChange) await this.props.onChange(value);
  }

  private async onTextAreaChange() {
    if (!this.props.autoGrow || !this.inputElement) return;

    if (this.hiddenInputElement) {
      this.hiddenInputElement.value = this.inputElement.value; // Synchronisez le texte avec le textarea invisible
      this.hiddenInputElement.rows = 1;

      // Assurez-vous que box-sizing est pris en compte
      const innerHeight =
        this.hiddenInputElement.scrollHeight -
        this.paddingTop -
        this.paddingBottom -
        this.borderTopWidth -
        this.borderBottomWidth;

      // Utilisez innerHeight pour le calcul des lignes
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

      await this.setStateAsync({ rows, activateScroll });
    }
  }
}
