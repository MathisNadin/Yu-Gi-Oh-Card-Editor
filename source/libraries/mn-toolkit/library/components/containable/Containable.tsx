import { AllHTMLAttributes, RefObject } from 'react';
import { classNames, isDefined, isNumber } from 'mn-tools';
import { TJSXElementChild, TBackgroundColor } from '../../system';
import { TIconId } from '../icon';
import {
  ToolkitComponent,
  IToolkitComponentProps,
  IToolkitComponentState,
  TDidUpdateSnapshot,
} from './ToolkitComponent';

export type TColSpan = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';

export type TFloatPosition =
  | 'none'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'middle-left'
  | 'middle-right';

export type TZIndex =
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

export interface IContainableProps<BASE_ELEMENT extends HTMLElement = HTMLDivElement> extends IToolkitComponentProps {
  s?: TColSpan;
  m?: TColSpan;
  l?: TColSpan;
  xl?: TColSpan;
  xxl?: TColSpan;
  className?: string;
  name?: string;
  id?: string;
  hint?: string;
  bg?: TBackgroundColor;
  disabled?: boolean;
  fill?: boolean;
  ghost?: boolean;
  zIndex?: TZIndex;
  tabIndex?: number;
  floatPosition?: TFloatPosition;
  height?: number | string;
  maxHeight?: number | string;
  minHeight?: number | string;
  width?: number | string;
  maxWidth?: number | string;
  minWidth?: number | string;
  scrollerPositionY?: number;
  draggable?: boolean;
  onDrop?: (event: React.DragEvent<BASE_ELEMENT>) => void | Promise<void>;
  onDragStart?: (event: React.DragEvent<BASE_ELEMENT>) => void | Promise<void>;
  onDragEnd?: (event: React.DragEvent<BASE_ELEMENT>) => void | Promise<void>;
  onDragEnter?: (event: React.DragEvent<BASE_ELEMENT>) => void | Promise<void>;
  onDragOver?: (event: React.DragEvent<BASE_ELEMENT>) => void | Promise<void>;
  onDragLeave?: (event: React.DragEvent<BASE_ELEMENT>) => void | Promise<void>;
  onMouseEnter?: (event: React.MouseEvent<BASE_ELEMENT>) => void | Promise<void>;
  onMouseLeave?: (event: React.MouseEvent<BASE_ELEMENT>) => void | Promise<void>;
  onMouseDown?: (event: React.MouseEvent<BASE_ELEMENT>) => void | Promise<void>;
  onMouseUp?: (event: React.MouseEvent<BASE_ELEMENT>) => void | Promise<void>;
  onTouchStart?: (event: React.TouchEvent<BASE_ELEMENT>) => void | Promise<void>;
  onTouchEnd?: (event: React.TouchEvent<BASE_ELEMENT>) => void | Promise<void>;
  onTap?: (event: React.MouseEvent<BASE_ELEMENT>) => void | Promise<void>;
  onScroll?: (event: React.UIEvent<BASE_ELEMENT>) => void | Promise<void>;
  onFocus?: (event: React.FocusEvent<BASE_ELEMENT>) => void | Promise<void>;
  onBlur?: (event: React.FocusEvent<BASE_ELEMENT>) => void | Promise<void>;
  onKeyUp?: (event: React.KeyboardEvent<BASE_ELEMENT>) => void | Promise<void>;
  onKeyDown?: (event: React.KeyboardEvent<BASE_ELEMENT>) => void | Promise<void>;
  style?: { [key: string]: number | boolean | string };
  tip?: IContainableTip;
}

export interface IContainableState extends IToolkitComponentState {
  loaded: boolean;
}

export class Containable<
  PROPS extends IContainableProps<BASE_ELEMENT>,
  STATE extends IContainableState,
  BASE_ELEMENT extends HTMLElement = HTMLDivElement,
> extends ToolkitComponent<PROPS, STATE, BASE_ELEMENT> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static override get defaultProps(): IContainableProps<any> {
    return {
      ...super.defaultProps,
      className: '',
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
      if (!this.base.current) return;
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

  public renderAttributes(): AllHTMLAttributes<BASE_ELEMENT> {
    const attributes: AllHTMLAttributes<BASE_ELEMENT> = {
      className: classNames(this.renderClasses()),
      style: this.renderStyle(),
      tabIndex: this.props.tabIndex,
      draggable: this.props.draggable,
      onClick: (e) => {
        if (this.props.onTap) app.$errorManager.handlePromise(this.props.onTap(e));
      },
      onScroll: (e) => {
        if (this.props.onScroll) app.$errorManager.handlePromise(this.props.onScroll(e));
      },
      onMouseEnter: (e) => {
        if (this.props.onMouseEnter) app.$errorManager.handlePromise(this.props.onMouseEnter(e));
      },
      onMouseLeave: (e) => {
        if (this.props.onMouseLeave) app.$errorManager.handlePromise(this.props.onMouseLeave(e));
      },
      onDragStart: (e) => {
        if (this.props.onDragStart) app.$errorManager.handlePromise(this.props.onDragStart(e));
      },
      onDragEnd: (e) => {
        if (this.props.onDragEnd) app.$errorManager.handlePromise(this.props.onDragEnd(e));
      },
      onDragLeave: (e) => {
        if (this.props.onDragLeave) app.$errorManager.handlePromise(this.props.onDragLeave(e));
      },
      onDragEnter: (e) => {
        if (this.props.onDragEnter) app.$errorManager.handlePromise(this.props.onDragEnter(e));
      },
      onFocus: (e) => {
        if (this.props.onFocus) app.$errorManager.handlePromise(this.props.onFocus(e));
      },
      onBlur: (e) => {
        if (this.props.onBlur) app.$errorManager.handlePromise(this.props.onBlur(e));
      },
      onKeyUp: (e) => {
        if (this.props.onKeyUp) app.$errorManager.handlePromise(this.props.onKeyUp(e));
      },
      onKeyDown: (e) => {
        if (this.props.onKeyDown) app.$errorManager.handlePromise(this.props.onKeyDown(e));
      },
      onMouseDown: (e) => {
        if (this.props.onMouseDown) app.$errorManager.handlePromise(this.props.onMouseDown(e));
      },
      onMouseUp: (e) => {
        if (this.props.onMouseUp) app.$errorManager.handlePromise(this.props.onMouseUp(e));
      },
      onTouchStart: (e) => {
        if (this.props.onTouchStart) app.$errorManager.handlePromise(this.props.onTouchStart(e));
      },
      onTouchEnd: (e) => {
        if (this.props.onTouchEnd) app.$errorManager.handlePromise(this.props.onTouchEnd(e));
      },
    };

    if (this.props.onDrop || this.props.onDragOver) {
      if (this.props.onDrop) {
        attributes.onDrop = (e) => {
          e.preventDefault();
          if (this.props.onDrop) app.$errorManager.handlePromise(this.props.onDrop(e));
        };
      }
      attributes.onDragOver = (e) => {
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

  public renderStyle(): { [key: string]: number | boolean | string } {
    const style: { [key: string]: number | boolean | string } = {};
    if (this.props.style) {
      for (const k in this.props.style) {
        style[k] = this.props.style[k];
      }
    }
    if (isDefined(this.props.height)) {
      style.height = isNumber(this.props.height) ? `${this.props.height}px` : this.props.height!;
    }
    if (isDefined(this.props.maxHeight)) {
      style.maxHeight = isNumber(this.props.maxHeight) ? `${this.props.maxHeight}px` : this.props.maxHeight!;
    }
    if (isDefined(this.props.minHeight)) {
      style.minHeight = isNumber(this.props.minHeight) ? `${this.props.minHeight}px` : this.props.minHeight!;
    }
    if (isDefined(this.props.width)) {
      style.width = isNumber(this.props.width) ? `${this.props.width}px` : this.props.width!;
    }
    if (isDefined(this.props.maxWidth)) {
      style.maxWidth = isNumber(this.props.maxWidth) ? `${this.props.maxWidth}px` : this.props.maxWidth!;
    }
    if (isDefined(this.props.minWidth)) {
      style.minWidth = isNumber(this.props.minWidth) ? `${this.props.minWidth}px` : this.props.minWidth!;
    }
    return style;
  }

  public override render(): TJSXElementChild {
    return (
      <div
        ref={this.base as unknown as RefObject<HTMLDivElement>}
        {...(this.renderAttributes() as unknown as AllHTMLAttributes<HTMLDivElement>)}
      >
        {this.children}
      </div>
    );
  }
}
