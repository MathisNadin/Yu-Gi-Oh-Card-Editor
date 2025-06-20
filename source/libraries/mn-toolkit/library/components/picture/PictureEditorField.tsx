import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { IPicture, IPictureEditorProps, PictureEditor } from './PictureEditor';

interface IPictureEditorFieldProps extends IFormFieldProps<IPicture>, IPictureEditorProps {}

interface IPictureEditorFieldState extends IFormFieldState {}

export class PictureEditorField extends FormField<IPicture, IPictureEditorFieldProps, IPictureEditorFieldState> {
  public static override get defaultProps(): Omit<
    IPictureEditorFieldProps,
    'imgAlt' | 'imgHint' | 'label' | 'value' | 'onChange'
  > {
    return {
      ...super.defaultProps,
      display: PictureEditor.defaultProps.display,
      size: PictureEditor.defaultProps.size,
      placeholder: PictureEditor.defaultProps.placeholder,
      options: PictureEditor.defaultProps.options,
    };
  }

  public constructor(props: IPictureEditorFieldProps) {
    super(props, 'picture');
  }

  public override get hasValue() {
    return !!PictureEditor.getPictureReferenceUrl(this.value);
  }

  protected override renderControl() {
    return (
      <PictureEditor
        display={this.props.display}
        size={this.props.size}
        options={this.props.options}
        placeholder={this.props.placeholder}
        imgAlt={this.props.imgAlt}
        imgHint={this.props.imgHint}
        value={this.props.value}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
