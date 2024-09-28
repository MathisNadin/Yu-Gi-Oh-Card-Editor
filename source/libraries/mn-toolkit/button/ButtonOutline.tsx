import { ButtonHTMLAttributes } from 'react';
import { IContainableProps, IContainableState, Containable } from '../containable';
import { TForegroundColor } from '../theme';

interface IButtonOutlineProps extends IContainableProps {
  label: string;
  color?: TForegroundColor;
  block?: boolean;
  buttonType?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

interface IButtonOutlineState extends IContainableState {}

export class ButtonOutline extends Containable<IButtonOutlineProps, IButtonOutlineState> {
  public static get defaultProps(): Partial<IButtonOutlineProps> {
    return {
      ...super.defaultProps,
      color: 'primary',
      block: false,
      disabled: false,
      buttonType: 'button',
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-button-outline'] = true;
    if (this.props.block) classes['mn-button-block'] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;
    return classes;
  }

  public override render() {
    return (
      <button {...this.renderAttributes()} type={this.props.buttonType}>
        {!!this.props.label && <span className='label'>{this.props.label}</span>}
      </button>
    );
  }
}
