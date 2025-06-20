import { AllHTMLAttributes, isValidElement, ReactNode, RefObject } from 'react';
import { IDeviceListener, IScreenSpec, TJSXElementChild, TJSXElementChildren } from '../../system';
import { Containable, IContainableProps, IContainableState, IGridSpanParams } from '../containable';

export type TContainerLayout = 'vertical' | 'horizontal' | 'grid';

export type THorizontalAlignment = 'left' | 'right' | 'center';

export type TVerticalAlignment = 'top' | 'bottom' | 'middle';

export type TFrame =
  | 'dashed'
  | 'shadow-0'
  | 'shadow-1'
  | 'shadow-2'
  | 'shadow-3'
  | 'shadow-4'
  | 'shadow-5'
  | 'shadow-6';

export interface EventTargetWithValue extends EventTarget {
  value: string;
}

export interface IContainerProps<
  BASE_ELEMENT extends HTMLElement = HTMLDivElement,
  LAYOUT extends TContainerLayout = TContainerLayout,
> extends IContainableProps<BASE_ELEMENT> {
  layout?: LAYOUT;
  gutter?: boolean;
  padding?: boolean;
  margin?: boolean;
  wrap?: boolean;
  scroll?: boolean;
  scrollX?: boolean;
  frame?: TFrame;
  itemAlignment?: THorizontalAlignment;
  verticalItemAlignment?: TVerticalAlignment;

  // For grid layout
  gridColumns?: LAYOUT extends 'grid' ? number : never;
  gridRows?: LAYOUT extends 'grid' ? number : never;
}

export interface IContainerState extends IContainableState {}

export class Container<
    PROPS extends IContainerProps<BASE_ELEMENT>,
    STATE extends IContainerState,
    BASE_ELEMENT extends HTMLElement = HTMLDivElement,
  >
  extends Containable<PROPS, STATE, BASE_ELEMENT>
  implements Partial<IDeviceListener>
{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static override get defaultProps(): IContainerProps<any> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    if (this.props.layout === 'grid') app.$device.addListener(this);
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    if (this.props.layout === 'grid') app.$device.removeListener(this);
  }

  public deviceScreenSpecificationChanged(_newSpec: IScreenSpec, _oldSpec: IScreenSpec, screenSizeChanged: boolean) {
    if (!screenSizeChanged || this.props.layout !== 'grid') return;
    this.forceUpdate();
  }

  public override renderStyle() {
    const style = super.renderStyle();
    if (this.props.layout !== 'grid') return style;

    style['--mn-grid-columns'] = this.props.gridColumns || 1;
    style['--mn-grid-rows'] = this.props.gridRows || 1;
    return style;
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

  public override get children(): TJSXElementChildren {
    if (this.props.layout !== 'grid') return super.children;

    if (!this.props.children) return this.props.children;

    if (!Array.isArray(this.props.children)) {
      return this.renderGridItem(this.props.children, 0);
    }

    return this.props.children.map((element, idx) => this.renderGridItem(element, idx));
  }

  protected renderGridItem(element: ReactNode, idx: number) {
    if (!element) return null;
    return (
      <div key={`mn-grid-item-${idx}`} className='mn-grid-item' style={this.getSpanVars(element)}>
        {element}
      </div>
    );
  }

  protected getSpanVars(element: NonNullable<ReactNode>): React.CSSProperties {
    // if it's a primitive or has no props, nothing to span
    if (!isValidElement(element)) {
      return {};
    }

    // extract the typed props for spans
    const props = element.props as IContainableProps;

    const screenOrder: (keyof IGridSpanParams)[] = [
      'small',
      'medium',
      'large',
      'xlarge',
      'xxlarge',
      'xxxlarge',
    ] as const;
    const currentScreen = app.$device?.screenSpec?.screenSize ?? 'small';
    const currentIndex = screenOrder.indexOf(currentScreen);

    // Initialize with fallback = 1
    let colSpan = 1;
    let rowSpan = 1;

    // Single loop to resolve both column and row spans
    for (let i = 0; i <= currentIndex; i++) {
      const key = screenOrder[i]!;

      // if a specific colSpan is provided for this breakpoint, use it
      const c = props.colSpans?.[key];
      if (c != null) colSpan = c!;

      // if a specific rowSpan is provided for this breakpoint, use it
      const r = props.rowSpans?.[key];
      if (r != null) rowSpan = r!;
    }

    return {
      '--mn-grid-col-span': `${colSpan}`,
      '--mn-grid-row-span': `${rowSpan}`,
    } as React.CSSProperties;
  }
}
