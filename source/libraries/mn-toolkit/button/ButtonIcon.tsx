import { ButtonHTMLAttributes } from 'react';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { TForegroundColor, TBackgroundColor } from '../themeSettings';
import { TIconId } from '../icon';

interface IButtonIconProps extends IContainableProps {
  icon: TIconId;
  color?: TForegroundColor;
  bg?: TBackgroundColor;
  size?: 'normal' | 'small';
  pressed?: boolean;
  buttonType?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

interface IButtonIconState extends IContainableState {}

export class ButtonIcon extends Containable<IButtonIconProps, IButtonIconState> {
  public static get defaultProps(): Partial<IButtonIconProps> {
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
    classes[`mn-size-${this.props.size}`] = true;
    classes[`mn-color-${this.props.color}`] = true;
    classes[`mn-bg-${this.props.bg}`] = true;
    return classes;
  }

  public override render() {
    return (
      <button {...this.renderAttributes()} type={this.props.buttonType}>
        {app.$icon.get(this.props.icon)}
      </button>
    );
  }
}
