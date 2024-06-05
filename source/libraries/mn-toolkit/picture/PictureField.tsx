import { isEmpty } from 'mn-tools';
import { FormField, IFormFieldProps, IFormFieldState } from '../form';
import { IPicture, IPictureEditorProps, PictureEditor } from './PictureEditor';

interface IPictureEditorFieldProps extends IFormFieldProps<IPicture>, IPictureEditorProps {}

interface IPictureEditorFieldState extends IFormFieldState<IPicture> {}

export class PictureEditorField extends FormField<IPicture, IPictureEditorFieldProps, IPictureEditorFieldState> {
  public static get defaultProps(): IPictureEditorFieldProps {
    return {
      ...super.defaultProps,
      ...PictureEditor.defaultProps,
    };
  }

  public constructor(props: IPictureEditorFieldProps) {
    super(props, 'picture');
    this.state = {
      ...this.state,
      value: props.defaultValue || { url: '', effects: [], changed: false },
    };

    if (props.required) {
      this.validators.unshift((field) => {
        if (isEmpty((field as PictureEditorField).value)) {
          return field.addError('Nous avons besoin besoin de quelque chose ici');
        }
        field.validate();
      });
    }
  }

  public get hasValue() {
    return true;
  }

  public componentDidUpdate(prevProps: IPictureEditorFieldProps) {
    if (this.props.defaultValue === prevProps.defaultValue) return;
    this.setState({ value: this.props.defaultValue || { url: '', effects: [], changed: false } });
  }

  private async onChange(value: IPicture) {
    await this.setStateAsync({ value });
    this.fireValueChanged();
    if (!!this.props.onChange) this.props.onChange(value);
  }

  public renderControl() {
    return (
      <PictureEditor
        defaultValue={this.props.defaultValue}
        emptyPictureUrl={this.props.emptyPictureUrl}
        hideToolbar={this.props.hideToolbar}
        camera={this.props.camera}
        file={this.props.file}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
