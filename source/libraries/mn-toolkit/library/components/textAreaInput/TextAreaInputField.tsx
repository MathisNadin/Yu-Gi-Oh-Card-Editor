import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { ITextAreaInputProps, TextAreaInput } from './TextAreaInput';

interface ITextAreaInputFieldProps extends IFormFieldProps<string>, ITextAreaInputProps {}

interface ITextAreaInputFieldState extends IFormFieldState {}

export class TextAreaInputField extends FormField<string, ITextAreaInputFieldProps, ITextAreaInputFieldState> {
  public static override get defaultProps(): Omit<
    ITextAreaInputFieldProps,
    'label' | 'value' | 'onChange' | 'fieldId' | 'fieldName'
  > {
    return {
      ...super.defaultProps,
    };
  }

  public constructor(props: ITextAreaInputFieldProps) {
    super(props, 'textarea');
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['multilines'] = true;
    return classes;
  }

  protected override renderControl() {
    return (
      <TextAreaInput
        inputId={this.props.fieldId}
        inputName={this.props.fieldName}
        inputMode={this.props.inputMode}
        autoComplete={this.props.autoComplete}
        disabled={this.props.disabled}
        minRows={this.props.minRows}
        maxRows={this.props.maxRows}
        autoGrow={this.props.autoGrow}
        autofocus={this.props.autofocus}
        placeholder={this.props.placeholder}
        value={this.value}
        spellCheck={this.props.spellCheck}
        onRef={(ref) => this.props.onRef && this.props.onRef(ref)}
        onBlurTextarea={() => this.onBlur()}
        onFocusTextarea={() => this.onFocus()}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
