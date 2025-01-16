import { ButtonHTMLAttributes, createRef, RefObject } from 'react';
import { classNames } from 'mn-tools';
import { TForegroundColor } from '../../system';
import { Containable, IContainableProps, IContainableState } from '../containable';

export type TIconId = keyof ISvgIcons;

export interface IIconProps extends IContainableProps<HTMLButtonElement | HTMLDivElement> {
  icon: TIconId;
  color: TForegroundColor;
  size: number;
  buttonType?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

export interface IIconState extends IContainableState {}

export class Icon<P extends IIconProps, S extends IIconState> extends Containable<
  P,
  S,
  HTMLButtonElement | HTMLDivElement
> {
  public iconRef = createRef<HTMLElement>();

  public static override get defaultProps(): IIconProps {
    return {
      ...super.defaultProps,
      size: 20,
      color: '1',
      buttonType: 'button',
      icon: 'toolkit-plus',
    };
  }

  public override renderStyle() {
    const style = super.renderStyle();
    style.width = `${this.props.size}px`;
    style.height = `${this.props.size}px`;
    style.maxWidth = `${this.props.size}px`;
    style.maxHeight = `${this.props.size}px`;
    style.minWidth = `${this.props.size}px`;
    style.minHeight = `${this.props.size}px`;
    return style;
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-icon'] = true;
    if (this.props.icon) classes[`mn-icon-${this.props.icon}`] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;
    return classes;
  }

  public override render() {
    const attributes = this.renderAttributes();
    if (this.props.onTap) {
      delete attributes.onClick;
      return (
        <button
          ref={this.base as RefObject<HTMLButtonElement>}
          className={classNames(
            'mn-icon-container-button',
            this.props.className ? `${this.props.className}-container-button` : ''
          )}
          onClick={(e) => this.props.onTap!(e)}
          type={this.props.buttonType}
        >
          {app.$icon.get(this.props.icon, attributes, this.iconRef)}
        </button>
      );
    }
    const icon = app.$icon.get(this.props.icon, attributes, this.iconRef);
    return icon || <div ref={this.base as RefObject<HTMLDivElement>}>{this.props.icon}</div>;
  }
}
