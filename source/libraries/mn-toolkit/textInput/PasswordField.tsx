import { Icon } from '../icon';
import { ITextFieldProps, ITextFieldState, TextField } from './TextField';
import { TextInput } from './TextInput';

interface IPasswordFieldProps extends ITextFieldProps {}

interface IPasswordFieldState extends ITextFieldState {
  revealPassword: boolean;
}

export class PasswordField extends TextField<IPasswordFieldProps, IPasswordFieldState> {
  public static get defaultProps(): IPasswordFieldProps {
    return {
      ...super.defaultProps,
      inputType: 'password',
    };
  }

  public constructor(props: IPasswordFieldProps) {
    super(props, 'password');
  }

  public renderIcon() {
    return (
      <Icon
        className='prop-icon'
        iconId={this.state.revealPassword ? 'toolkit-eye-close' : 'toolkit-eye-open'}
        onTap={(e) => this.onStatusIconClick(e)}
      />
    );
  }

  public onStatusIconClick(_e: React.MouseEvent) {
    this.setState({ revealPassword: !this.state.revealPassword });
  }

  public renderControl() {
    return (
      <TextInput
        ref={this.inputElement}
        name={this.props.name}
        inputType={this.state.revealPassword ? 'text' : 'password'}
        disabled={this.props.disabled}
        placeholder={this.props.placeholder}
        minLength={this.props.minLength}
        maxLength={this.props.maxLength}
        defaultValue={this.state.value}
        onKeyDown={(e) => this.onKeyDown(e)}
        onBlur={() => this.onBlur()}
        onFocus={() => this.onFocus()}
        onChange={(value) => this.onChange(value)}
      />
    );
  }
}
