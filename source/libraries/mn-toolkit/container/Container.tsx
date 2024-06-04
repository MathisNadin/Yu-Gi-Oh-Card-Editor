import { JSXElementChildren } from '../react';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { createRef } from 'react';

export type TContainerLayout = 'vertical' | 'horizontal' | 'grid';

export type THorizontalAlignment = 'left' | 'right' | 'center';

export type TVerticalAlignment = 'top' | 'bottom' | 'middle';

export type TFrame = 'dashed' | 'shadow-1';

export interface EventTargetWithValue extends EventTarget {
  value: string;
}

export interface IContainerProps extends IContainableProps {
  layout?: TContainerLayout;
  gutter?: boolean;
  paddingHorizontal?: boolean;
  paddingVertical?: boolean;
  padding?: boolean;
  marginHorizontal?: boolean;
  marginVertical?: boolean;
  margin?: boolean;
  wrap?: boolean;
  scroll?: boolean;
  scrollX?: boolean;
  frame?: TFrame;
  verticalItemAlignment?: TVerticalAlignment;
  itemAlignment?: THorizontalAlignment;
  onContainerScroll?: (event: UIEvent) => void | Promise<void>;
  onScrollRef?: (scroller: HTMLElement) => void;
}

export interface IContainerState extends IContainableState {}

export class Container<PROPS extends IContainerProps, STATE extends IContainerState> extends Containable<PROPS, STATE> {
  public containerRef = createRef<HTMLDivElement>();

  public get base() {
    return this.containerRef;
  }

  public static get defaultProps(): IContainerProps {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
    };
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-container'] = true;
    if (this.props.layout) classes[`mn-layout-${this.props.layout}-stack`] = true;
    if (this.props.gutter) classes['mn-layout-gutter'] = true;
    if (this.props.marginHorizontal) classes['mn-layout-margin-horizontal'] = true;
    if (this.props.marginVertical) classes['mn-layout-margin-vertical'] = true;
    if (this.props.margin) classes['mn-layout-margin'] = true;
    if (this.props.paddingHorizontal) classes['mn-layout-padding-horizontal'] = true;
    if (this.props.paddingVertical) classes['mn-layout-padding-vertical'] = true;
    if (this.props.padding) classes['mn-layout-padding'] = true;
    if (this.props.wrap) classes['mn-layout-wrap'] = true;
    if (this.props.scroll) classes['mn-scroll'] = true;
    if (this.props.scrollX) classes['mn-scrollX'] = true;
    if (this.props.frame) classes[`mn-frame-${this.props.frame}`] = true;
    if (this.props.verticalItemAlignment) classes[`mn-layout-item-valign-${this.props.verticalItemAlignment}`] = true;
    if (this.props.itemAlignment) classes[`mn-layout-item-align-${this.props.itemAlignment}`] = true;
    return classes;
  }

  public render() {
    return (
      <div {...this.renderAttributes()} ref={this.containerRef}>
        {this.inside}
      </div>
    );
  }

  public get inside(): JSXElementChildren {
    return <div className='mn-container-inside'>{this.children}</div>;
  }
}
