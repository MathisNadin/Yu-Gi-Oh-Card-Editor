import { wait } from 'mn-tools';
import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { IRichTextEditorProps, RichTextEditor } from '.';

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
  }

  public override get hasValue() {
    return !RichTextEditor.isEmpty(this.value);
  }

  // onBlur est aussi appelé quand on clique sur sur une option du popover du RichTextEditor
  // Or ici ça provoque un re-render qui déclenche le onReceiveProps et fait perdre la modification
  // On setTimeout le render avec un léger décalage pour passer après le onInput
  protected override async onBlur() {
    await wait(1);
    await super.onBlur();
  }

  protected override async onFocus() {
    await wait(1);
    await super.onFocus();
  }

  protected override renderControl() {
    return (
      <RichTextEditor
        height={this.props.height}
        width={this.props.width}
        defaultValue={this.state.value}
        toolsSettings={this.props.toolsSettings}
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
