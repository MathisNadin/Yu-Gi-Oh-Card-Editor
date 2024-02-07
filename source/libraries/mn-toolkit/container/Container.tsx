import { classNames } from 'libraries/mn-tools';
import { ScrollContainer } from './ScrollContainer';
import { Containable, IContainableProps, IContainableState } from 'libraries/mn-toolkit/containable';

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
  frame: TFrame;
  verticalItemAlignment?: TVerticalAlignment;
  itemAlignment?: THorizontalAlignment;
  onContainerScroll?: (event: UIEvent) => void | Promise<void>;
  onScrollRef?: (scroller: HTMLElement) => void;
}

export interface IContainerState extends IContainableState {
}

export class Container<PROPS extends IContainerProps, STATE extends IContainerState> extends Containable<PROPS, STATE> {

  public static get defaultProps(): Partial<IContainerProps> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
    };
  }

  public renderClasses(name?: string) {
    let classes = super.renderClasses(name);
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
    if(this.props.frame) classes[`mn-frame-${this.props.frame}`] = true;
    if (this.props.verticalItemAlignment) classes[`mn-layout-item-valign-${this.props.verticalItemAlignment}`] = true;
    if (this.props.itemAlignment) classes[`mn-layout-item-align-${this.props.itemAlignment}`] = true;
    return classes;
  }

  public shouldComponentUpdate() {
    return true;
  }

  public render() {
    if (!this.props.scroll && !this.props.scrollX) return this.renderAttributes(<div >{this.props.children}</div>, 'mn-container');
    return <ScrollContainer
      style={this.renderStyle()}
      className={classNames(super.renderClasses())}
      viewClassName={classNames(this.renderClasses('mn-container'))}
      onContainerScroll={this.props.onContainerScroll}
      onScrollRef={this.props.onScrollRef}
      scroll={!!this.props.scroll}
      scrollX={!!this.props.scrollX}>
      {this.props.children}
    </ScrollContainer>;
  }

};
