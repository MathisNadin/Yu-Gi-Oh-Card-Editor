import { ButtonHTMLAttributes } from 'react';
import { IContainableProps, Containable, IContainableState } from '../containable';
import { TBackgroundColor, TForegroundColor } from '../theme';
import { Icon, TIconId } from '../icon';

export interface IButtonProps extends IContainableProps {
  label: string;
  color?: TForegroundColor;
  bg?: TBackgroundColor;
  block?: boolean;
  icon?: TIconId;
  iconPosition?: 'left' | 'right';
  buttonType?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

interface IButtonState extends IContainableState {}

export class Button extends Containable<IButtonProps, IButtonState> {
  public static get defaultProps(): Partial<IButtonProps> {
    return {
      ...super.defaultProps,
      block: false,
      disabled: false,
      color: 'primary',
      iconPosition: 'left',
      buttonType: 'button',
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-button'] = true;
    if (this.props.block) classes['mn-button-block'] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;
    if (this.props.bg) classes[`mn-button-bg-${this.props.bg}`] = true;
    classes['mn-button-icon-and-text'] = !!this.props.icon && !!this.props.label;
    classes[`mn-icon-position-${this.props.iconPosition}`] = true;
    return classes;
  }

  public override render() {
    return (
      <button {...this.renderAttributes()} type={this.props.buttonType}>
        {this.props.icon && <Icon className='icon' size={18} icon={this.props.icon} />}
        {!!this.props.label && <span className='label'>{this.props.label}</span>}
      </button>
    );
  }
}
