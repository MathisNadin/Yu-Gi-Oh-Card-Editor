import { TJSXElementChildren } from '../../system';
import { Icon } from '../icon';
import { ITextInputFieldProps, ITextInputFieldState, TextInputField } from './TextInputField';
import { TextInput } from './TextInput';

interface IPasswordFieldProps extends ITextInputFieldProps {}

interface IPasswordFieldState extends ITextInputFieldState {
  revealPassword: boolean;
}

export class PasswordField extends TextInputField<IPasswordFieldProps, IPasswordFieldState> {
  public static override get defaultProps(): IPasswordFieldProps {
    return {
      ...super.defaultProps,
      inputType: 'password',
    };
  }

  public constructor(props: IPasswordFieldProps) {
    super(props, 'password');
  }

  protected override renderPropIcon(): TJSXElementChildren {
    return (
      <Icon
        className='prop-icon'
        name={this.state.revealPassword ? 'Cacher le mot de passe' : 'Voir le mot de passe en clair'}
        icon={this.state.revealPassword ? 'toolkit-eye-close' : 'toolkit-eye-open'}
        onTap={() => this.setStateAsync({ revealPassword: !this.state.revealPassword })}
      />
    );
  }

  protected override renderControl() {
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
