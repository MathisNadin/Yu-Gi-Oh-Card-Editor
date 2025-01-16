import { ButtonHTMLAttributes } from 'react';
import { TForegroundColor } from '../../system';
import { IContainableProps, IContainableState, Containable } from '../containable';

interface IButtonOutlineProps extends IContainableProps<HTMLButtonElement> {
  label: string;
  color?: TForegroundColor;
  block?: boolean;
  buttonType?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

interface IButtonOutlineState extends IContainableState {}

export class ButtonOutline extends Containable<IButtonOutlineProps, IButtonOutlineState, HTMLButtonElement> {
  public static override get defaultProps(): IButtonOutlineProps {
    return {
      ...super.defaultProps,
      color: 'primary',
      block: false,
      disabled: false,
      buttonType: 'button',
      label: '',
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
      <button {...this.renderAttributes()} ref={this.base} type={this.props.buttonType}>
        {!!this.props.label && <span className='label'>{this.props.label}</span>}
      </button>
    );
  }
}
