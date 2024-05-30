import { IContainableProps, Containable, IContainableState } from '../containable';
import { classNames, integer } from 'mn-tools';
import { FormEvent } from 'react';

export interface ITextAreaInputProps extends IContainableProps {
  rows?: number;
  /** Set the minimum of row. */
  minRows?: number;
  /** Set the maximum of row. */
  maxRows?: number;
  autoGrow?: boolean;
  autofocus?: boolean;
  placeholder?: string;
  defaultValue?: string;
  onRef?: (ref: HTMLTextAreaElement) => void;
  onChange?: (value: string) => void | Promise<void>;
}

interface ITextAreaInputState extends IContainableState {
  value: string;
  rows: number;
  activateScroll: boolean;
}

export class TextAreaInput extends Containable<ITextAreaInputProps, ITextAreaInputState> {
  private inputElement!: HTMLTextAreaElement;
  private hiddenInputElement!: HTMLTextAreaElement;
  private lineHeight!: number;
  private paddingTop!: number;
  private paddingBottom!: number;
  private borderTopWidth!: number;
  private borderBottomWidth!: number;

  public static get defaultProps(): Partial<ITextAreaInputProps> {
    return {
      ...super.defaultProps,
      minRows: 5,
      maxRows: 10,
      autoGrow: false,
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

  public componentDidUpdate(prevProps: ITextAreaInputProps) {
    if (prevProps !== this.props && this.props.defaultValue?.trim() !== this.state.value?.trim()) {
      this.setState({ value: this.props.defaultValue! }, () => {
        if (this.inputElement) {
          setTimeout(() => this.onTextAreaChange({ target: this.inputElement } as unknown as FormEvent));
        }
      });
    }
  }

  public componentDidMount() {
    if (this.props.autofocus && !app.$device.isNative) {
      setTimeout(() => {
        this.inputElement.focus();
      }, 100);
    }
  }

  public doFocus() {
    if (this.inputElement) this.inputElement.focus();
  }

  public render() {
    return (
      <div className={classNames('mn-textarea-input-container', this.props.className)}>
        <textarea
          ref={(c) => this.onDomInput(c!)}
          className={classNames('mn-textarea-input', this.props.className)}
          name={this.props.name}
          disabled={this.props.disabled}
          rows={this.state.rows}
          placeholder={this.props.placeholder}
          defaultValue={this.state.value}
          onBlur={(e) => this.props.onBlur && app.$errorManager.handlePromise(this.props.onBlur(e))}
          onFocus={(e) => this.props.onFocus && app.$errorManager.handlePromise(this.props.onFocus(e))}
          onInput={(e) => this.onChange(e)}
          onKeyUp={(e) => this.onChange(e)}
          // FIXME MN : Un peu bâtard, ça empêche le scroll tant qu'on n'a pas dépassé le nombre de maxRows
          // Utile notamment quand on force une police/lineHeight plus haut qu'à la normale
          style={{ overflowY: this.state.activateScroll ? undefined : 'hidden' }}
        />

        <textarea
          ref={(c) => this.hiddenOnDomInput(c!)}
          className={classNames('mn-textarea-input', this.props.className, 'mn-textarea-input-hidden')}
          disabled={this.props.disabled}
          rows={this.state.rows}
          placeholder={this.props.placeholder}
          defaultValue={this.state.value}
          style={{ overflowY: this.state.activateScroll ? undefined : 'hidden' }}
        />
      </div>
    );
  }

  private onDomInput(c: HTMLTextAreaElement) {
    if (!c || this.inputElement) return;
    this.inputElement = c;
    if (this.props.onRef) this.props.onRef(this.inputElement);
    this.setupStyle();
  }

  private hiddenOnDomInput(c: HTMLTextAreaElement) {
    if (!c || this.hiddenInputElement) return;
    this.hiddenInputElement = c;
    this.setupStyle();
  }

  private setupStyle() {
    if (!this.inputElement || !this.hiddenInputElement) return;
    setTimeout(() => {
      const hiddenInputStyle = getComputedStyle(this.hiddenInputElement);
      this.lineHeight = integer(hiddenInputStyle.lineHeight);
      this.paddingTop = integer(hiddenInputStyle.paddingTop);
      this.paddingBottom = integer(hiddenInputStyle.paddingBottom);
      this.borderTopWidth = integer(hiddenInputStyle.borderTopWidth);
      this.borderBottomWidth = integer(hiddenInputStyle.borderBottomWidth);
      this.onTextAreaChange({ target: this.inputElement } as unknown as FormEvent);
    });
  }

  private onChange(e: FormEvent) {
    const value = e.target.value as string;
    if (value === this.state.value) return;
    this.setState({ value });
    this.onTextAreaChange(e);
    if (this.props.onChange) app.$errorManager.handlePromise(this.props.onChange(value));
  }

  private onTextAreaChange(event: FormEvent) {
    if (!this.props.autoGrow) return;
    const target = event.target as HTMLTextAreaElement;

    if (this.hiddenInputElement) {
      this.hiddenInputElement.value = target.value; // Synchronisez le texte avec le textarea invisible
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

      let rows: number;
      let activateScroll: boolean;

      if (currentRows > this.props.maxRows!) {
        rows = this.props.maxRows!;
        activateScroll = true;
      } else {
        rows = currentRows;
        activateScroll = false;
      }

      target.rows = rows;
      this.hiddenInputElement.rows = rows;
      this.setState({ rows, activateScroll });
    }
  }
}
