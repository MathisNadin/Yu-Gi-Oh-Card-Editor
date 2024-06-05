import { isEmpty } from 'mn-tools';
import { IRichTextEditorProps, RichTextEditor } from '.';
import { FormField, IFormFieldProps, IFormFieldState } from '../form';

interface IRichTextFieldProps extends IFormFieldProps<string>, IRichTextEditorProps {}

interface IRichTextEditorFieldState extends IFormFieldState<string> {}

export class RichTextEditorField extends FormField<string, IRichTextFieldProps, IRichTextEditorFieldState> {
  public static get defaultProps(): IRichTextFieldProps {
    return {
      ...super.defaultProps,
      defaultValue: '',
    };
  }

  public constructor(props: IRichTextFieldProps) {
    super(props, 'rich-text-editor');
    this.state = { ...this.state, value: props.defaultValue! };

    if (props.required) {
      this.validators.unshift((field) => {
        if (isEmpty((field as RichTextEditorField).value)) {
          return field.addError('Nous avons besoin de quelque chose ici');
        }
        field.validate();
      });
    }
  }

  public componentDidUpdate(prevProps: IRichTextFieldProps) {
    if (prevProps === this.props) return;
    if (this.props.defaultValue?.trim() !== this.state.value?.trim()) {
      this.setState({ value: this.props.defaultValue! });
      if (this.validators.length && this.props.required) {
        app.$errorManager.handlePromise(this.doValidation());
      }
    }
  }

  public get hasValue() {
    return true;
  }

  private async onChange(value: string) {
    await this.setStateAsync({ value });
    this.fireValueChanged();
    if (!!this.props.onChange) this.props.onChange(value);
  }

  public renderControl() {
    return (
      <RichTextEditor
        height={this.props.height}
        width={this.props.width}
        defaultValue={this.state.value}
        toolsSettings={this.props.toolsSettings}
        textColors={this.props.textColors}
        placeholder={this.props.placeholder}
        bg={this.props.bg}
        onBlur={() => this.onBlur()}
        onFocus={() => this.onFocus()}
        onChange={(value) => this.onChange(value)}
        onSelectionChanged={(selection) => this.props.onSelectionChanged && this.props.onSelectionChanged(selection)}
      />
    );
  }
}
