import { isEmail } from 'mn-tools';
import { ITextInputFieldProps, ITextInputFieldState, TextInputField } from './TextInputField';

interface IEmailFieldProps extends ITextInputFieldProps {}

interface IEmailFieldState extends ITextInputFieldState {}

export class EmailField extends TextInputField<IEmailFieldProps, IEmailFieldState> {
  public static override get defaultProps(): IEmailFieldProps {
    return {
      ...super.defaultProps,
      inputType: 'email',
    };
  }

  public constructor(props: IEmailFieldProps) {
    super(props, 'email');
    this.validators.unshift((field) => {
      if (isEmail(field.value)) field.validate();
      else field.addError("Ceci n'est pas un email");
    });
  }
}
