import { createRef } from 'react';
import { isEmpty } from 'mn-tools';
import { FormField, IFormFieldProps, IFormFieldState } from '../form/FormField';
import { ITextAreaInputProps, TextAreaInput } from './TextAreaInput';

interface ITextAreaFieldProps extends IFormFieldProps<string>, ITextAreaInputProps {}

interface ITextAreaFieldState extends IFormFieldState<string> {}

export class TextAreaField extends FormField<string, ITextAreaFieldProps, ITextAreaFieldState> {
  private textareaElement = createRef<TextAreaInput>();

  public static get defaultProps(): ITextAreaFieldProps {
    return {
      ...super.defaultProps,
      defaultValue: '',
    };
  }

  public constructor(props: ITextAreaFieldProps) {
    super(props, 'textarea');
    this.state = {
      ...this.state,
      value: props.defaultValue!,
    };

    if (props.required) {
      this.validators.unshift((field) => {
        if (isEmpty((field as TextAreaField).value)) return field.addError('Nous avons besoin de quelque chose ici');
        field.validate();
      });
    }
  }

  public componentDidUpdate(prevProps: ITextAreaFieldProps) {
    if (prevProps === this.props) return;
    if (this.props.defaultValue?.trim() !== this.state.value?.trim()) {
      this.setState({ value: this.props.defaultValue! });
      if (this.validators.length && this.props.required) {
        app.$errorManager.handlePromise(this.doValidation());
      }
    }
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['multilines'] = true;
    return classes;
  }

  public renderControl() {
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
        onRef={(ref) => this.props.onRef && this.props.onRef(ref)}
        onBlur={() => this.onBlur()}
        onFocus={() => this.onFocus()}
        onChange={(value) => this.onChange(value)}
      />
    );
  }

  private onChange(value: string) {
    this.setState({ value });
    this.fireValueChanged();
    if (!!this.props.onChange) this.props.onChange(value);
  }

  public doClickItem() {
    if (this.textareaElement?.current) this.textareaElement.current.doFocus();
  }
}
