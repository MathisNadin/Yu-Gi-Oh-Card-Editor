import { classNames } from 'libraries/mn-tools';
import { IContainableProps, IContainableState, Containable } from '../containable';
import { FormEvent } from 'react';
import { IDeviceListener, IScreenSpec } from '../device';

export interface ITextAreaInputProps extends IContainableProps {
  rows?: number;
  minRows?: number;
  maxRows?: number;
  autoGrow?: boolean;
  autofocus?: boolean;
  spellCheck?: boolean;
  placeholder?: string;
  defaultValue: string;
  lineHeight?: number;
  onRef?: (ref: HTMLTextAreaElement) => void;
  onChange?: (value: string) => void | Promise<void>;
  onBlur?: () => void;
  onFocus?: () => void;
}

interface ITextAreaInputState extends IContainableState {
  value: string;
  rows: number;
  activateScroll: boolean;
}

export class TextAreaInput
  extends Containable<ITextAreaInputProps, ITextAreaInputState>
  implements Partial<IDeviceListener>
{
  private inputElement!: HTMLTextAreaElement;
  private hiddenInputElement!: HTMLTextAreaElement;

  public static get defaultProps(): Partial<ITextAreaInputProps> {
    return {
      ...super.defaultProps,
      minRows: 5,
      maxRows: 10,
      autoGrow: false,
      spellCheck: true,
      lineHeight: 20,
    };
  }

  public deviceScreenSpecificationChanged(_newSpec: IScreenSpec) {
    if (!this.inputElement || !this.props.autoGrow) return;
    this.onTextAreaChange({ target: this.inputElement } as unknown as FormEvent);
  }

  public constructor(props: ITextAreaInputProps) {
    super(props);
    this.state = { ...this.state, rows: props.minRows || 1, value: props.defaultValue };
    app.$device.addListener(this);
  }

  public componentWillUnmount() {
    app.$device.removeListener(this);
  }

  public componentDidUpdate(prevProps: ITextAreaInputProps) {
    if (prevProps !== this.props && this.props.defaultValue?.trim() !== this.state.value?.trim()) {
      this.setState({ value: this.props.defaultValue }, () => {
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
      <div className='mn-textarea-input-container'>
        <textarea
          ref={(ref) => this.onDomInput(ref)}
          className={classNames('mn-textarea-input', this.props.className)}
          spellCheck={this.props.spellCheck}
          name={this.props.name}
          disabled={this.props.disabled}
          rows={this.state.rows}
          placeholder={this.props.placeholder}
          value={this.state.value}
          onBlur={() => this.onBlur()}
          onFocus={() => this.onFocus()}
          onChange={(e) => this.onChange(e)}
          // onKeyUp={(e) => this.onChange(e)}
          // FIXME MN : Un peu bâtard, ça empêche le scroll tant qu'on n'a pas dépassé le nombre de maxRows
          // Utile notamment quand on force une police/lineHeight plus haut qu'à la normale
          style={{ overflowY: this.state.activateScroll ? undefined : 'hidden' }}
        />

        <textarea
          ref={(c) => this.hiddenOnDomInput(c)}
          className={classNames('mn-textarea-input', this.props.className, 'mn-textarea-input-hidden')}
          disabled={this.props.disabled}
          rows={this.state.rows}
          placeholder={this.props.placeholder}
          value={this.state.value}
          style={{ overflowY: this.state.activateScroll ? undefined : 'hidden' }}
          onChange={() => {}}
        />
      </div>
    );
  }

  private onBlur() {
    if (this.props.onBlur) this.props.onBlur();
  }

  private onFocus() {
    if (this.props.onFocus) this.props.onFocus();
  }

  private onDomInput(c: HTMLTextAreaElement | null) {
    if (!c || this.inputElement) return;
    this.inputElement = c;
    setTimeout(() => this.onTextAreaChange({ target: c } as unknown as FormEvent));
    if (this.props.onRef) this.props.onRef(this.inputElement);
  }

  private hiddenOnDomInput(c: HTMLTextAreaElement | null) {
    if (!c || this.hiddenInputElement) return;
    this.hiddenInputElement = c;
  }

  private onChange(e: FormEvent) {
    const value = e.target.value as string;
    this.setState({ value }, () => {
      this.onTextAreaChange(e);
      setTimeout(() => {
        if (this.props.onChange) {
          app.$errorManager.handlePromise(this.props.onChange(this.state.value));
        }
      });
    });
  }

  private onTextAreaChange(event: FormEvent) {
    if (!this.props.autoGrow) return;
    const target = event.target as HTMLTextAreaElement;

    if (this.hiddenInputElement) {
      this.hiddenInputElement.value = target.value; // Synchronisez le texte avec le textarea invisible
      this.hiddenInputElement.rows = 1;
      const currentRows = Math.floor(this.hiddenInputElement.scrollHeight / (this.props.lineHeight as number));

      let rows: number;
      let activateScroll: boolean;

      if (currentRows > (this.props.maxRows as number)) {
        rows = this.props.maxRows as number;
        activateScroll = true;
      } else if (currentRows < (this.props.minRows as number)) {
        rows = this.props.minRows as number;
        activateScroll = false;
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
