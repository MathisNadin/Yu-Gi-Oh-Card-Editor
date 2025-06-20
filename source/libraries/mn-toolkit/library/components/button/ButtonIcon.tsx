import { ButtonHTMLAttributes } from 'react';
import { TForegroundColor, TBackgroundColor } from '../../system';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { TIconId } from '../icon';

interface IButtonIconProps extends IContainableProps<HTMLButtonElement> {
  icon: TIconId;
  color?: TForegroundColor;
  bg?: TBackgroundColor;
  size?: 'normal' | 'small';
  pressed?: boolean;
  buttonType?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

interface IButtonIconState extends IContainableState {}

export class ButtonIcon extends Containable<IButtonIconProps, IButtonIconState, HTMLButtonElement> {
  public static override get defaultProps(): Omit<IButtonIconProps, 'icon'> {
    return {
      ...super.defaultProps,
      color: '1',
      disabled: false,
      pressed: false,
      size: 'normal',
      buttonType: 'button',
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-button-icon'] = true;
    classes['pressed'] = !!this.props.pressed;
    if (this.props.size) classes[`mn-size-${this.props.size}`] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;
    if (this.props.bg) classes[`mn-bg-${this.props.bg}`] = true;
    return classes;
  }

  public override render() {
    return (
      <button {...this.renderAttributes()} ref={this.base} type={this.props.buttonType}>
        {app.$icon.get(this.props.icon)}
      </button>
    );
  }
}
