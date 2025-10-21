import { HTMLInputAutoCompleteAttribute } from 'react';
import { TJSXElementChildren } from '../../system';
import { Icon } from '../icon';
import { ITextInputFieldProps, ITextInputFieldState, TextInputField } from './TextInputField';
import { TextInput } from './TextInput';

interface IPasswordFieldProps extends ITextInputFieldProps {
  autoComplete: HTMLInputAutoCompleteAttribute;
}

interface IPasswordFieldState extends ITextInputFieldState {
  revealPassword: boolean;
}

export class PasswordField extends TextInputField<IPasswordFieldProps, IPasswordFieldState> {
  public static override get defaultProps(): Omit<
    IPasswordFieldProps,
    'label' | 'value' | 'onChange' | 'fieldId' | 'fieldName' | 'autoComplete'
  > {
    return {
      ...super.defaultProps,
      inputType: 'password',
      spellCheck: false,
    };
  }

  public constructor(props: IPasswordFieldProps) {
    super(props, 'password');
  }

  protected override renderControl(): TJSXElementChildren {
    return [
      <TextInput
        key='input'
        ref={this.inputElement}
        id={this.props.fieldId}
        name={this.props.fieldName}
        inputType={this.state.revealPassword ? 'text' : 'password'}
        autoComplete={this.props.autoComplete}
        inputMode={this.props.inputMode}
        spellCheck={this.props.spellCheck}
        disabled={this.props.disabled}
        placeholder={this.props.placeholder}
        minLength={this.props.minLength}
        maxLength={this.props.maxLength}
        value={this.value}
        onChange={(value) => this.onChange(value)}
        onKeyDown={(e) => this.onKeyDown(e)}
        onBlur={() => this.onBlur()}
        onFocus={() => this.onFocus()}
      />,
      <Icon
        key='password-eye'
        className='prop-icon'
        name={this.state.revealPassword ? 'Cacher le mot de passe' : 'Voir le mot de passe en clair'}
        icon={this.state.revealPassword ? 'toolkit-eye-close' : 'toolkit-eye-open'}
        onTap={() => this.setStateAsync({ revealPassword: !this.state.revealPassword })}
      />,
    ];
  }
}
