import './styles.scss';
import { classNames } from "libraries/mn-tools";
import { IContainableProps, IContainableState, Containable } from "../containable/Containable";
import { FormEvent } from "react";
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
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

interface ITextAreaInputState extends IContainableState {
  value: string;
  rows: number;
  activateScroll: boolean;
}

export class TextAreaInput extends Containable<ITextAreaInputProps, ITextAreaInputState> implements Partial<IDeviceListener> {
  private inputElement!: HTMLTextAreaElement;

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
    this.state = { ...(this.state || {}), rows: props.minRows as number || 1, value: props.defaultValue };
    app.$device.addListener(this);
  }

  public componentWillUnmount() {
    app.$device.removeListener(this);
  }

  public componentWillReceiveProps(nextProps: Readonly<ITextAreaInputProps>) {
    // Si on applique trim() sur la source des props,
    // alors la state.value peut se retrouver écrasée par le même texte mais sans les espaces à la fin
    // -> l'utilisateur ne comprend pas que son texte soit "mangé" sans raison à chaque fois qu'il fait espace
    if (nextProps.defaultValue?.trim() !== this.state.value?.trim()) {
      this.setState({ value: nextProps.defaultValue });
      if (this.inputElement) setTimeout(() => this.onTextAreaChange({ target: this.inputElement } as unknown as FormEvent));
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
    return <textarea
      ref={ref => !!ref && this.onDomInput(ref)}
      className={classNames('mn-textarea-input', this.props.className)}
      spellCheck={this.props.spellCheck}
      name={this.props.name}
      disabled={this.props.disabled}
      rows={this.state.rows}
      placeholder={this.props.placeholder}
      value={this.state.value}
      onBlur={() => this.onBlur()}
      onFocus={() => this.onFocus()}
      onInput={e => this.onChange(e)}
      onKeyUp={e => this.onChange(e)}
      // FIXME MN : Un peu bâtard, ça empêche le scroll tant qu'on n'a pas dépassé le nombre de maxRows
      // Utile notamment quand on force une police/lineHeight plus haut qu'à la normale
      style={{ overflowY: this.state.activateScroll ? undefined : 'hidden' }}
    />;
  }

  private onBlur() {
    if (this.props.onBlur) this.props.onBlur();
  }

  private onFocus() {
    if (this.props.onFocus) this.props.onFocus();
  }

  private onDomInput(c: HTMLTextAreaElement) {
    if (!c || this.inputElement) return;
    this.inputElement = c;
    setTimeout(() => this.onTextAreaChange({ target: c } as unknown as FormEvent));
    if (this.props.onRef) this.props.onRef(this.inputElement);
  }

  private onChange(e: FormEvent) {
    const value = e.target.value as string;
    this.setState({ value }, () => {
      // this.onTextAreaChange(e);
      setTimeout(() => this.onTextAreaChange(e));
      if (this.props.onChange) this.props.onChange(value);
    });
  }

  private onTextAreaChange(event: FormEvent): void {
    if (!this.props.autoGrow) return;
    let target: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
    const previousRows = target.rows;
    target.rows = 1; // reset number of rows in textarea
    const currentRows = Math.floor(target.scrollHeight / (this.props.lineHeight as number));

    if (currentRows === previousRows) {
      target.rows = currentRows;
    }

    if (currentRows >= (this.props.maxRows as number)) {
      target.rows = this.props.maxRows as number;
      target.scrollTop = target.scrollHeight;
    }

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
    this.setState({ rows, activateScroll });
  }
}