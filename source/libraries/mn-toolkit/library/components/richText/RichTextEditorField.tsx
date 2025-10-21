import { createRef } from 'react';
import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { IRichTextEditorProps, RichTextEditor, TRichTextBaseToolId } from '.';

interface IRichTextEditorFieldProps<TOOL_IDS extends string = TRichTextBaseToolId>
  extends IFormFieldProps<string>,
    IRichTextEditorProps<TOOL_IDS> {}

interface IRichTextEditorFieldState extends IFormFieldState {}

export class RichTextEditorField<TOOL_IDS extends string = TRichTextBaseToolId> extends FormField<
  string,
  IRichTextEditorFieldProps<TOOL_IDS>,
  IRichTextEditorFieldState
> {
  private editorRef = createRef<RichTextEditor<TOOL_IDS>>();

  public static override get defaultProps(): Omit<
    IRichTextEditorFieldProps,
    'label' | 'value' | 'onChange' | 'fieldId' | 'fieldName' | 'onEditorInit' | 'toolbarOptions'
  > & { toolbarOptions: typeof RichTextEditor.defaultProps.toolbarOptions } {
    return {
      ...super.defaultProps,
      initialConfig: RichTextEditor.defaultProps.initialConfig,
      toolbarOptions: RichTextEditor.defaultProps.toolbarOptions,
      toolbarMode: RichTextEditor.defaultProps.toolbarMode,
      placeholder: RichTextEditor.defaultProps.placeholder,
      spellCheck: RichTextEditor.defaultProps.spellCheck,
    };
  }

  public constructor(props: IRichTextEditorFieldProps<TOOL_IDS>) {
    super(props, 'rich-text-editor');
  }

  public override get hasValue() {
    return !!this.editorRef.current && !this.editorRef.current.isEmpty();
  }

  protected override renderControl() {
    return (
      <RichTextEditor<TOOL_IDS>
        ref={this.editorRef}
        inputId={this.props.fieldId}
        inputName={this.props.fieldName}
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
