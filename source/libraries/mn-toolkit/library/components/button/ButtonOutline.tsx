import { ButtonHTMLAttributes } from 'react';
import { TForegroundColor } from '../../system';
import { IContainableProps, IContainableState, Containable } from '../containable';
import { Typography } from '../typography';

interface IButtonOutlineProps extends IContainableProps<HTMLButtonElement> {
  name: string;
  label: string;
  color?: TForegroundColor;
  size?: 'normal' | 'small';
  block?: boolean;
  buttonType?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

interface IButtonOutlineState extends IContainableState {}

export class ButtonOutline extends Containable<IButtonOutlineProps, IButtonOutlineState, HTMLButtonElement> {
  public static override get defaultProps(): Omit<IButtonOutlineProps, 'name' | 'label'> {
    return {
      ...super.defaultProps,
      color: 'primary',
      size: 'normal',
      block: false,
      disabled: false,
      buttonType: 'button',
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-button-outline'] = true;
    if (this.props.size) classes[`mn-size-${this.props.size}`] = true;
    if (this.props.block) classes['mn-button-block'] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;
    return classes;
  }

  public override render() {
    return (
      <button {...this.renderAttributes()} ref={this.base} type={this.props.buttonType}>
        {!!this.props.label && (
          <Typography
            className='label'
            fill
            noWrap
            alignment='center'
            variant='document'
            contentType='text'
            content={this.props.label}
          />
        )}
      </button>
    );
  }
}
