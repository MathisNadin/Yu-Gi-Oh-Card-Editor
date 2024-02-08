import { Component, MouseEvent, PropsWithChildren, ReactElement, cloneElement } from 'react';
import { classNames, isDefined, isNumber } from 'libraries/mn-tools';
import { TBackgroundColor } from '../themeSettings';

export type ColSpan = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';

export type FloatPosition =
  | 'none'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'middle-left'
  | 'middle-right';

export type ZIndex =
  | 'content'
  | 'title-bar'
  | 'pane'
  | 'slider-pager'
  | 'view'
  | 'notifications'
  | 'view-below'
  | 'view-above'
  | 'drawer'
  | 'overlay'
  | 'popup'
  | 'popover'
  | 'toaster'
  | 'overall';

export interface IContainableProps extends PropsWithChildren {
  s?: ColSpan;
  m?: ColSpan;
  l?: ColSpan;
  xl?: ColSpan;
  xxl?: ColSpan;
  nodeId?: string;
  className?: string;
  mainClassName?: string;
  name?: string;
  id?: string;
  hint?: string;
  bg?: TBackgroundColor;
  disabled?: boolean;
  fill?: boolean;
  ghost?: boolean;
  zIndex?: ZIndex;
  floatPosition?: FloatPosition;
  height?: number | string;
  maxHeight?: number | string;
  minHeight?: number | string;
  width?: number | string;
  maxWidth?: number | string;
  minWidth?: number | string;
  scrollerPositionY?: number;
  draggable?: boolean;
  onDrop?: (event: DragEvent) => void | Promise<void>;
  onDragStart?: (event: DragEvent) => void | Promise<void>;
  onDragEnd?: (event: DragEvent) => void | Promise<void>;
  onDragEnter?: (event: DragEvent) => void | Promise<void>;
  onDragOver?: (event: DragEvent) => void | Promise<void>;
  onDragLeave?: (event: DragEvent) => void | Promise<void>;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  onTap?: (e: MouseEvent) => void | Promise<void>;
  onScroll?: (event: UIEvent) => void | Promise<void>;
  style?: { [key: string]: number | boolean | string };
}

export interface IContainableState {
  loaded: boolean;
}

export class Containable<PROPS extends IContainableProps, STATE extends IContainableState> extends Component<
  PROPS,
  STATE
> {
  public static get defaultProps(): Partial<IContainableProps> {
    return {
      zIndex: 'content',
      floatPosition: 'none',
    };
  }

  public constructor(props: PROPS) {
    super(props);
    this.state = {} as STATE;
  }

  public renderClasses(name?: string) {
    const classes: { [key: string]: boolean } = {};
    if (this.props.className) classes[this.props.className] = true;
    if (!!this.props.mainClassName) {
      classes[this.props.mainClassName] = true;
    } else if (!!name) {
      classes[name] = true;
    }
    classes['has-click'] = !!this.props.onTap;
    classes['mn-fill'] = !!this.props.fill;
    classes['mn-ghost'] = !!this.props.ghost;
    classes['mn-disable'] = !!this.props.disabled;
    classes['mn-draggable'] = !!this.props.draggable;
    if (this.props.bg) classes[`mn-bg-${this.props.bg}`] = true;
    if (this.props.zIndex) classes[`mn-zindex-${this.props.zIndex}`] = true;
    if (this.props.floatPosition) classes[`mn-float-${this.props.floatPosition}`] = true;
    return classes;
  }

  public renderAttributes(fc: ReactElement, name?: string) {
    let newProps = {
      ...fc.props,
      className: classNames(this.renderClasses(name)),
      style: this.renderStyle(),
      onClick: (e: MouseEvent) => app.$errorManager.handlePromise(this.props.onTap?.(e)),
      onScroll: (e: UIEvent) => app.$errorManager.handlePromise(this.props.onScroll?.(e)),
      draggable: this.props.draggable,
      onMouseEnter: (e: MouseEvent) => app.$errorManager.handlePromise(this.props.onMouseEnter?.(e)),
      onMouseLeave: (e: MouseEvent) => app.$errorManager.handlePromise(this.props.onMouseLeave?.(e)),
      onDragStart: (e: DragEvent) => app.$errorManager.handlePromise(this.props.onDragStart?.(e)),
      onDragEnd: (e: DragEvent) => app.$errorManager.handlePromise(this.props.onDragEnd?.(e)),
      onDragLeave: (e: DragEvent) => app.$errorManager.handlePromise(this.props.onDragLeave?.(e)),
      onDragEnter: (e: DragEvent) => app.$errorManager.handlePromise(this.props.onDragEnter?.(e)),
    };

    if (this.props.onDrop || this.props.onDragOver) {
      if (this.props.onDrop)
        newProps.onDrop = (e: DragEvent) => {
          e.preventDefault();
          app.$errorManager.handlePromise(this.props.onDrop?.(e));
        };
      newProps.onDragOver = (e: DragEvent) => {
        // Nécessaire pour que l'event onDrop fonctionne bien
        if (this.props.onDrop) {
          e.stopPropagation();
          e.preventDefault();
        }
        if (this.props.onDragOver) app.$errorManager.handlePromise(this.props.onDragOver(e));
      };
    }

    if (this.props.id) newProps.id = this.props.id;
    if (this.props.name) newProps.name = this.props.name;
    if (this.props.hint) newProps.title = this.props.hint;

    return cloneElement(fc, newProps, fc.props.children) as ReactElement;
  }

  public renderStyle() {
    let style: { [key: string]: number | boolean | string } = {};
    if (this.props.style) {
      for (let k in this.props.style) {
        style[k] = this.props.style[k];
      }
    }
    if (isDefined(this.props.height))
      style.height = isNumber(this.props.height) ? `${this.props.height}px` : (this.props.height as string);
    if (isDefined(this.props.maxHeight))
      style.maxHeight = isNumber(this.props.maxHeight) ? `${this.props.maxHeight}px` : (this.props.maxHeight as string);
    if (isDefined(this.props.minHeight))
      style.minHeight = isNumber(this.props.minHeight) ? `${this.props.minHeight}px` : (this.props.minHeight as string);
    if (isDefined(this.props.width))
      style.width = isNumber(this.props.width) ? `${this.props.width}px` : (this.props.width as string);
    if (isDefined(this.props.maxWidth))
      style.maxWidth = isNumber(this.props.maxWidth) ? `${this.props.maxWidth}px` : (this.props.maxWidth as string);
    if (isDefined(this.props.minWidth))
      style.minWidth = isNumber(this.props.minWidth) ? `${this.props.minWidth}px` : (this.props.minWidth as string);
    return style;
  }

  public render() {
    return this.renderAttributes(<div>{this.props.children}</div>, 'mn-containable');
  }

  public inside() {
    return this.props.children;
  }
}
