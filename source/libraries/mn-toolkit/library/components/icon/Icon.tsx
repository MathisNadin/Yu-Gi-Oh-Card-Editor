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
    // Case : top container is a button
    if (this.props.onTap) {
      classes['mn-icon-container-button'] = true;
      if (this.props.className) classes[`${this.props.className}-container-button`] = true;
    }
    // Case : topcontainer is the icon itself
    else {
      const iconClasses = this.renderIconClasses();
      for (const key in iconClasses) {
        classes[key] = iconClasses[key];
      }
    }
    return classes;
  }

  private renderIconClasses() {
    const iconClasses: { [key: string]: boolean } = {};
    iconClasses['mn-containable'] = true;
    if (this.props.className) iconClasses[this.props.className] = true;
    iconClasses['has-click'] = !!this.props.onTap;
    iconClasses['mn-icon'] = true;
    if (this.props.icon) iconClasses[`mn-icon-${this.props.icon}`] = true;
    if (this.props.color) iconClasses[`mn-color-${this.props.color}`] = true;
    return iconClasses;
  }

  public override render() {
    const attributes = this.renderAttributes();
    if (this.props.onTap) {
      delete attributes.onClick;
      return (
        <button
          ref={this.base as RefObject<HTMLButtonElement>}
          {...attributes}
          onClick={(e) => this.props.onTap!(e)}
          type={this.props.buttonType}
        >
          {app.$icon.get(
            this.props.icon,
            { ...attributes, className: classNames(this.renderIconClasses()) },
            this.iconRef
          )}
        </button>
      );
    }

    const icon = app.$icon.get(this.props.icon, attributes, this.iconRef);
    return icon || <div ref={this.base as RefObject<HTMLDivElement>}>{this.props.icon}</div>;
  }
}
