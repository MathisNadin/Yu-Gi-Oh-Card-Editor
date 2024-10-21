import { AllHTMLAttributes, createRef, RefObject } from 'react';
import { classNames, isDefined, isNumber } from 'mn-tools';
import { TIconId } from '../icon';
import { TBackgroundColor } from '../theme';
import {
  ToolkitComponent,
  IToolkitComponentProps,
  IToolkitComponentState,
  TDidUpdateSnapshot,
} from './ToolkitComponent';

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

export interface IContainableTip {
  uuid: string;
  message: string;
  icon: TIconId;
}

export interface IContainableProps extends IToolkitComponentProps {
  s?: ColSpan;
  m?: ColSpan;
  l?: ColSpan;
  xl?: ColSpan;
  xxl?: ColSpan;
  nodeId?: string;
  className?: string;
  name?: string;
  id?: string;
  hint?: string;
  bg?: TBackgroundColor;
  disabled?: boolean;
  fill?: boolean;
  ghost?: boolean;
  zIndex?: ZIndex;
  tabIndex?: number;
  floatPosition?: FloatPosition;
  height?: number | string;
  maxHeight?: number | string;
  minHeight?: number | string;
  width?: number | string;
  maxWidth?: number | string;
  minWidth?: number | string;
  scrollerPositionY?: number;
  draggable?: boolean;
  onDrop?: (event: React.DragEvent) => void | Promise<void>;
  onDragStart?: (event: React.DragEvent) => void | Promise<void>;
  onDragEnd?: (event: React.DragEvent) => void | Promise<void>;
  onDragEnter?: (event: React.DragEvent) => void | Promise<void>;
  onDragOver?: (event: React.DragEvent) => void | Promise<void>;
  onDragLeave?: (event: React.DragEvent) => void | Promise<void>;
  onMouseEnter?: (event: React.MouseEvent) => void | Promise<void>;
  onMouseLeave?: (event: React.MouseEvent) => void | Promise<void>;
  onMouseDown?: (event: React.MouseEvent) => void | Promise<void>;
  onMouseUp?: (event: React.MouseEvent) => void | Promise<void>;
  onTouchStart?: (event: React.TouchEvent) => void | Promise<void>;
  onTouchEnd?: (event: React.TouchEvent) => void | Promise<void>;
  onTap?: (event: React.MouseEvent) => void | Promise<void>;
  onScroll?: (event: React.UIEvent) => void | Promise<void>;
  onFocus?: (event: React.FocusEvent) => void | Promise<void>;
  onBlur?: (event: React.FocusEvent) => void | Promise<void>;
  onKeyUp?: (event: React.KeyboardEvent) => void | Promise<void>;
  onKeyDown?: (event: React.KeyboardEvent) => void | Promise<void>;
  style?: { [key: string]: number | boolean | string };
  tip?: IContainableTip;
}

export interface IContainableState extends IToolkitComponentState {
  loaded: boolean;
}

export class Containable<
  PROPS extends IContainableProps,
  STATE extends IContainableState,
  BASE_ELEMENT extends HTMLElement = HTMLDivElement,
> extends ToolkitComponent<PROPS, STATE> {
  public base = createRef<BASE_ELEMENT>();

  public static get defaultProps(): Partial<IContainableProps> {
    return {
      zIndex: 'content',
      floatPosition: 'none',
    };
  }

  public constructor(props: PROPS) {
    super(props);
  }

  public override componentDidMount() {
    super.componentDidMount();
    this.showTips();
  }

  public override componentDidUpdate(
    prevProps: Readonly<PROPS>,
    prevState: Readonly<STATE>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
  }

  protected showTips() {
    const { tip } = this.props;
    if (!tip || !!app.$tips.isAlreadySeen(tip.uuid)) return;
    setTimeout(() => {
      if (!this.base?.current) return;
      app.$tips.show(this.base.current.getBoundingClientRect(), tip);
    }, 1000);
  }

  public renderClasses() {
    const classes: { [key: string]: boolean } = {};
    classes['mn-containable'] = true;
    if (this.props.className) classes[this.props.className] = true;
    classes['has-click'] = !!this.props.onTap;
    classes['mn-fill'] = !!this.props.fill;
    classes['mn-ghost'] = !!this.props.ghost;
    classes['mn-disabled'] = !!this.props.disabled;
    classes['mn-draggable'] = !!this.props.draggable;
    if (this.props.bg) classes[`mn-bg-${this.props.bg}`] = true;
    if (this.props.zIndex) classes[`mn-zindex-${this.props.zIndex}`] = true;
    if (this.props.floatPosition) classes[`mn-float-${this.props.floatPosition}`] = true;
    return classes;
  }

  public renderAttributes(): AllHTMLAttributes<HTMLElement> {
    const attributes: AllHTMLAttributes<HTMLElement> = {
      className: classNames(this.renderClasses()),
      style: this.renderStyle(),
      tabIndex: this.props.tabIndex,
      draggable: this.props.draggable,
      onClick: (e: React.MouseEvent) => app.$errorManager.handlePromise(this.props.onTap?.(e)),
      onScroll: (e: React.UIEvent) => app.$errorManager.handlePromise(this.props.onScroll?.(e)),
      onMouseEnter: (e: React.MouseEvent) => app.$errorManager.handlePromise(this.props.onMouseEnter?.(e)),
      onMouseLeave: (e: React.MouseEvent) => app.$errorManager.handlePromise(this.props.onMouseLeave?.(e)),
      onDragStart: (e: React.DragEvent) => app.$errorManager.handlePromise(this.props.onDragStart?.(e)),
      onDragEnd: (e: React.DragEvent) => app.$errorManager.handlePromise(this.props.onDragEnd?.(e)),
      onDragLeave: (e: React.DragEvent) => app.$errorManager.handlePromise(this.props.onDragLeave?.(e)),
      onDragEnter: (e: React.DragEvent) => app.$errorManager.handlePromise(this.props.onDragEnter?.(e)),
      onFocus: (e: React.FocusEvent) => app.$errorManager.handlePromise(this.props.onFocus?.(e)),
      onBlur: (e: React.FocusEvent) => app.$errorManager.handlePromise(this.props.onBlur?.(e)),
      onKeyUp: (e: React.KeyboardEvent) => app.$errorManager.handlePromise(this.props.onKeyUp?.(e)),
      onKeyDown: (e: React.KeyboardEvent) => app.$errorManager.handlePromise(this.props.onKeyDown?.(e)),
      onMouseDown: (e: React.MouseEvent) => app.$errorManager.handlePromise(this.props.onMouseDown?.(e)),
      onMouseUp: (e: React.MouseEvent) => app.$errorManager.handlePromise(this.props.onMouseUp?.(e)),
      onTouchStart: (e: React.TouchEvent) => app.$errorManager.handlePromise(this.props.onTouchStart?.(e)),
      onTouchEnd: (e: React.TouchEvent) => app.$errorManager.handlePromise(this.props.onTouchEnd?.(e)),
    };

    if (this.props.onDrop || this.props.onDragOver) {
      if (this.props.onDrop)
        attributes.onDrop = (e: React.DragEvent) => {
          e.preventDefault();
          app.$errorManager.handlePromise(this.props.onDrop?.(e));
        };
      attributes.onDragOver = (e: React.DragEvent) => {
        // Nécessaire pour que l'event onDrop fonctionne bien
        if (this.props.onDrop) {
          e.stopPropagation();
          e.preventDefault();
        }
        if (this.props.onDragOver) app.$errorManager.handlePromise(this.props.onDragOver(e));
      };
    }

    if (this.props.id) attributes.id = this.props.id;
    if (this.props.name) attributes.name = this.props.name;
    if (this.props.hint) attributes.title = this.props.hint;

    return attributes;
  }

  public renderStyle() {
    const style: { [key: string]: number | boolean | string } = {};
    if (this.props.style) {
      for (const k in this.props.style) {
        style[k] = this.props.style[k];
      }
    }
    if (isDefined(this.props.height)) {
      style.height = isNumber(this.props.height) ? `${this.props.height}px` : (this.props.height as string);
    }
    if (isDefined(this.props.maxHeight)) {
      style.maxHeight = isNumber(this.props.maxHeight) ? `${this.props.maxHeight}px` : (this.props.maxHeight as string);
    }
    if (isDefined(this.props.minHeight)) {
      style.minHeight = isNumber(this.props.minHeight) ? `${this.props.minHeight}px` : (this.props.minHeight as string);
    }
    if (isDefined(this.props.width)) {
      style.width = isNumber(this.props.width) ? `${this.props.width}px` : (this.props.width as string);
    }
    if (isDefined(this.props.maxWidth)) {
      style.maxWidth = isNumber(this.props.maxWidth) ? `${this.props.maxWidth}px` : (this.props.maxWidth as string);
    }
    if (isDefined(this.props.minWidth)) {
      style.minWidth = isNumber(this.props.minWidth) ? `${this.props.minWidth}px` : (this.props.minWidth as string);
    }
    return style;
  }

  public override render() {
    return (
      <div ref={this.base as unknown as RefObject<HTMLDivElement>} {...this.renderAttributes()}>
        {this.children}
      </div>
    );
  }
}
