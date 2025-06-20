import { createRef } from 'react';
import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { IRichTextEditorProps, RichTextEditor } from '.';

interface IRichTextEditorFieldProps extends IFormFieldProps<string>, IRichTextEditorProps {}

interface IRichTextEditorFieldState extends IFormFieldState {}

export class RichTextEditorField extends FormField<string, IRichTextEditorFieldProps, IRichTextEditorFieldState> {
  private editorRef = createRef<RichTextEditor>();

  public static override get defaultProps(): Omit<
    IRichTextEditorFieldProps,
    'label' | 'value' | 'onChange' | 'onEditorInit'
  > {
    return {
      ...super.defaultProps,
      initialConfig: RichTextEditor.defaultProps.initialConfig,
      toolbarOptions: RichTextEditor.defaultProps.toolbarOptions,
      toolbarMode: RichTextEditor.defaultProps.toolbarMode,
      placeholder: RichTextEditor.defaultProps.placeholder,
    };
  }

  public constructor(props: IRichTextEditorFieldProps) {
    super(props, 'rich-text-editor');
  }

  public override get hasValue() {
    return !!this.editorRef.current && !this.editorRef.current.isEmpty();
  }

  protected override renderControl() {
    return (
      <RichTextEditor
        ref={this.editorRef}
        initialConfig={this.props.initialConfig}
        toolbarMode={this.props.toolbarMode}
        toolbarOptions={this.props.toolbarOptions}
        toolbarColors={this.props.toolbarColors}
        toolbarCustomTools={this.props.toolbarCustomTools}
        placeholder={this.props.placeholder}
        value={this.value}
        onChange={(value) => this.onChange(value)}
        onBlur={() => this.onBlur()}
        onFocus={() => this.onFocus()}
      />
    );
  }
}
