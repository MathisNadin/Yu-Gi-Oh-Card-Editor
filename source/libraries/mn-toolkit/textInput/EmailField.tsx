import { isEmail } from 'mn-tools';
import { ITextFieldProps, ITextFieldState, TextField } from './TextField';

interface IEmailFieldProps extends ITextFieldProps {}

interface IEmailFieldState extends ITextFieldState {}

export class EmailField extends TextField<IEmailFieldProps, IEmailFieldState> {
  public static get defaultProps(): IEmailFieldProps {
    return {
      ...super.defaultProps,
      inputType: 'email',
    };
  }

  public constructor(props: IEmailFieldProps) {
    super(props, 'email');
    this.validators.unshift((field) => {
      if (!isEmail((field as EmailField).value)) return field.addError("Ceci n'est pas un email");
      field.validate();
    });
  }
}
