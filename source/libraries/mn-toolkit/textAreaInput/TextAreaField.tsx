import { createRef } from 'react';
import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { ITextAreaInputProps, TextAreaInput } from './TextAreaInput';

interface ITextAreaFieldProps extends IFormFieldProps<string>, ITextAreaInputProps {}

interface ITextAreaFieldState extends IFormFieldState<string> {}

export class TextAreaField extends FormField<string, ITextAreaFieldProps, ITextAreaFieldState> {
  private textareaElement = createRef<TextAreaInput>();

  public static get defaultProps(): ITextAreaFieldProps {
    return {
      ...super.defaultProps,
      ...TextAreaInput.defaultProps,
      defaultValue: '',
    };
  }

  public constructor(props: ITextAreaFieldProps) {
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
        ref={this.textareaElement}
        name={this.props.name}
        disabled={this.props.disabled}
        rows={this.props.rows}
        minRows={this.props.minRows}
        maxRows={this.props.maxRows}
        autoGrow={this.props.autoGrow}
        autofocus={this.props.autofocus}
        placeholder={this.props.placeholder}
        defaultValue={this.state.value}
        spellCheck={this.props.spellCheck}
        onRef={(ref) => this.props.onRef && this.props.onRef(ref)}
        onBlur={() => this.onBlur()}
        onFocus={() => this.onFocus()}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
