import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { IPicture, IPictureEditorProps, PictureEditor } from './PictureEditor';

interface IPictureEditorFieldProps extends IFormFieldProps<IPicture>, IPictureEditorProps {}

interface IPictureEditorFieldState extends IFormFieldState<IPicture> {}

export class PictureEditorField extends FormField<IPicture, IPictureEditorFieldProps, IPictureEditorFieldState> {
  public static override get defaultProps(): IPictureEditorFieldProps {
    return {
      ...super.defaultProps,
      imgAlt: PictureEditor.defaultProps.imgAlt,
      display: PictureEditor.defaultProps.display,
      size: PictureEditor.defaultProps.size,
      options: PictureEditor.defaultProps.options,
      defaultValue: PictureEditor.defaultProps.defaultValue,
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
        defaultValue={this.props.defaultValue}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
