import { AllHTMLAttributes, RefObject } from 'react';
import { TJSXElementChild, TJSXElementChildren } from '../../system';
import { Containable, IContainableProps, IContainableState } from '../containable';

export type TContainerLayout = 'vertical' | 'horizontal' | 'grid';

export type THorizontalAlignment = 'left' | 'right' | 'center';

export type TVerticalAlignment = 'top' | 'bottom' | 'middle';

export type TFrame = 'dashed' | 'shadow-1';

export interface EventTargetWithValue extends EventTarget {
  value: string;
}

export interface IContainerProps<BASE_ELEMENT extends HTMLElement = HTMLDivElement>
  extends IContainableProps<BASE_ELEMENT> {
  layout?: TContainerLayout;
  gutter?: boolean;
  padding?: boolean;
  margin?: boolean;
  wrap?: boolean;
  scroll?: boolean;
  scrollX?: boolean;
  frame?: TFrame;
  itemAlignment?: THorizontalAlignment;
  verticalItemAlignment?: TVerticalAlignment;
}

export interface IContainerState extends IContainableState {}

export class Container<
  PROPS extends IContainerProps<BASE_ELEMENT>,
  STATE extends IContainerState,
  BASE_ELEMENT extends HTMLElement = HTMLDivElement,
> extends Containable<PROPS, STATE, BASE_ELEMENT> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static override get defaultProps(): IContainerProps<any> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-container'] = true;
    if (this.props.layout) classes[`mn-layout-${this.props.layout}-stack`] = true;
    if (this.props.gutter) classes['mn-layout-gutter'] = true;
    if (this.props.margin) classes['mn-layout-margin'] = true;
    if (this.props.padding) classes['mn-layout-padding'] = true;
    if (this.props.wrap) classes['mn-layout-wrap'] = true;
    if (this.props.scroll) classes['mn-scroll'] = true;
    if (this.props.scrollX) classes['mn-scroll-x'] = true;
    if (this.props.frame) classes[`mn-frame-${this.props.frame}`] = true;
    if (this.props.verticalItemAlignment) classes[`mn-layout-item-valign-${this.props.verticalItemAlignment}`] = true;
    if (this.props.itemAlignment) classes[`mn-layout-item-align-${this.props.itemAlignment}`] = true;
    return classes;
  }

  public override render(): TJSXElementChild {
    return (
      <div
        ref={this.base as unknown as RefObject<HTMLDivElement>}
        {...(this.renderAttributes() as unknown as AllHTMLAttributes<HTMLDivElement>)}
      >
        {this.inside}
      </div>
    );
  }

  public get inside(): TJSXElementChildren {
    return <div className='mn-container-inside'>{this.children}</div>;
  }
}
