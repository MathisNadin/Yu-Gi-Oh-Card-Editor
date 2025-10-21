import { ButtonHTMLAttributes, createRef, RefObject } from 'react';
import { classNames, isNumber, isString } from 'mn-tools';
import { TForegroundColor } from '../../system';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { TTypographyFontSize } from '../typography';

export type TIconId = keyof ISvgIcons;

export interface IIconProps extends IContainableProps<HTMLButtonElement | HTMLDivElement> {
  icon: TIconId;
  color: TForegroundColor;
  size: number | TTypographyFontSize;
  buttonName?: string;
  buttonType?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

export interface IIconState extends IContainableState {}

export class Icon<P extends IIconProps, S extends IIconState> extends Containable<
  P,
  S,
  HTMLButtonElement | HTMLDivElement
> {
  public iconRef = createRef<HTMLElement>();

  public static override get defaultProps(): Omit<IIconProps, 'icon'> {
    return {
      ...super.defaultProps,
      size: 20,
      color: '1',
      buttonType: 'button',
    };
  }

  protected get icon(): TIconId {
    return this.props.icon;
  }

  public override renderStyle() {
    const style = super.renderStyle();

    let size: string;
    if (isNumber(this.props.size)) {
      size = `${this.props.size}px`;
    } else if (isString(this.props.size)) {
      size = `var(--${this.props.size}-size)`;
    } else {
      size = '';
    }

    style['--icon-size'] = size;
    return style;
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    // Case : top container is a button
    if (this.onTapFunction) {
      classes['mn-icon-container-button'] = true;
      if (this.icon) classes[`mn-icon-${this.icon}-container-button`] = true;
      if (this.props.className) {
        delete classes[this.props.className];
        classes[`${this.props.className}-container-button`] = true;
      }
    }
    // Case : top container is the icon itself
    else {
      const iconClasses = this.renderIconClasses();
      for (const key in iconClasses) {
        classes[key] = iconClasses[key]!;
      }
    }
    return classes;
  }

  protected renderIconClasses() {
    const iconClasses: { [key: string]: boolean } = {};
    iconClasses['mn-containable'] = true;
    if (this.props.className) iconClasses[this.props.className] = true;
    iconClasses['has-click'] = !!this.onTapFunction;
    iconClasses['mn-icon'] = true;
    if (this.icon) iconClasses[`mn-icon-${this.icon}`] = true;
    if (this.props.color) iconClasses[`mn-color-${this.props.color}`] = true;
    return iconClasses;
  }

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    // Case : top container is a button
    if (this.onTapFunction) delete attributes.onClick;
    return attributes;
  }

  /** Defines if the icon is a button */
  protected get onTapFunction() {
    return this.onTap || this.props.onTap;
  }

  protected onTap?(): void;

  public override render() {
    const attributes = this.renderAttributes();
    if (this.onTapFunction) {
      return (
        <button
          ref={this.base as RefObject<HTMLButtonElement>}
          {...attributes}
          name={this.props.buttonName || `${this.props.name || this.props.icon}-button-container`}
          onClick={(e) => this.onTapFunction!(e)}
          type={this.props.buttonType}
        >
          {app.$icon.get(this.icon, { ...attributes, className: classNames(this.renderIconClasses()) }, this.iconRef)}
        </button>
      );
    }

    const icon = app.$icon.get(this.icon, attributes, this.iconRef);
    return icon || <div ref={this.base as RefObject<HTMLDivElement>}>{this.icon}</div>;
  }
}
