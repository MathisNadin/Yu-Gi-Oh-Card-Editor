import { Containable, IContainableProps, IContainableState } from '../containable';
import { TForegroundColor } from '../themeSettings';

export type TIconId = keyof ISvgIcons;

export interface IIconProps extends IContainableProps {
  iconId: TIconId;
  color: TForegroundColor;
  size: number;
}

export interface IIconState extends IContainableState {}

export class Icon<P extends IIconProps, S extends IIconState> extends Containable<P, S> {
  public static get defaultProps(): Partial<IIconProps> {
    return {
      ...super.defaultProps,
      size: 20,
      color: '1',
    };
  }

  public renderStyle() {
    const style = super.renderStyle();
    style.width = `${this.props.size}px`;
    style.height = `${this.props.size}px`;
    style.maxWidth = `${this.props.size}px`;
    style.maxHeight = `${this.props.size}px`;
    style.minWidth = `${this.props.size}px`;
    style.minHeight = `${this.props.size}px`;
    return style;
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-icon'] = true;
    classes[`mn-icon-${this.props.iconId}`] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;
    return classes;
  }

  public render() {
    const icon = app.$icon.get(this.props.iconId, this.renderAttributes());
    return icon || <div>{this.props.iconId}</div>;
  }
}
