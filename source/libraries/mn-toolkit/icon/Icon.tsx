import { ReactElement } from 'react';
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
    };
  }

  public constructor(props: P) {
    super(props);
  }

  public renderAttributes(node: ReactElement, mainClassName: string) {
    const updatedNode = super.renderAttributes(node, mainClassName);
    if (this.props.size) {
      updatedNode.props.style.width = `${this.props.size}px`;
      updatedNode.props.style.height = `${this.props.size}px`;
      updatedNode.props.style.maxWidth = `${this.props.size}px`;
      updatedNode.props.style.maxHeight = `${this.props.size}px`;
      updatedNode.props.style.minWidth = `${this.props.size}px`;
      updatedNode.props.style.minHeight = `${this.props.size}px`;
    }
    return updatedNode;
  }

  public renderClasses(name?: string) {
    let classes = super.renderClasses(name);
    classes[`mn-icon-${this.props.iconId}`] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;
    return classes;
  }

  public render() {
    const icon = app.$icon.get(this.props.iconId);
    if (!icon) return <div>{this.props.iconId}</div>;
    return this.renderAttributes(icon, 'mn-icon');
  }
}
