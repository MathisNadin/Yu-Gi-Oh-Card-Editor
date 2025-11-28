import { AllHTMLAttributes, isValidElement, ReactNode, RefObject } from 'react';
import { isArray, isObject, isString, isUndefined } from 'mn-tools';
import { IDeviceListener, IScreenSpec, TJSXElementChild, TJSXElementChildren, TScreenSize } from '../../system';
import { Containable, IContainableProps, IContainableState, TSpacingSize } from '../containable';

export type TContainerLayout = 'vertical' | 'horizontal' | 'grid' | 'masonry';

export type THorizontalAlignment = 'left' | 'right' | 'center' | 'space-between';

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

// Track size expression: can be a raw CSS string or a structured expression
export type TTrackSizeExpr =
  | string // e.g. "100px", "1fr", "min-content", "max-content"
  | ITrackSizeMinmax
  | ITrackSizeFitContent;

export interface ITrackSizeMinmax {
  kind: 'minmax';
  min: TTrackSizeExpr | string;
  max: TTrackSizeExpr | string;
}

export interface ITrackSizeFitContent {
  kind: 'fit-content';
  value: string; // e.g. "40%", "300px"
}

// A single template segment inside grid-template-*
export type TGridTemplateSegment =
  | string // raw CSS segment, e.g. "200px", "[foo] 100px [bar]"
  | IGridTemplateNamedTrack
  | IGridTemplateRepeat;

// A single named track segment: [names] size [names]
export interface IGridTemplateNamedTrack {
  kind: 'track';
  lineNamesBefore?: string | string[];
  size: TTrackSizeExpr;
  lineNamesAfter?: string | string[];
}

// A repeat(...) segment
export interface IGridTemplateRepeat {
  kind: 'repeat';
  count: number | 'auto-fill' | 'auto-fit';
  track: TGridTemplateSegment | TGridTemplateSegment[];
}

// Top-level preset: either a keyword or a track list
export type IGridTemplatePreset = IGridTemplateKeyword | IGridTemplateTrackList;

// Keywords like "none", "inherit", "initial", "unset"
export interface IGridTemplateKeyword {
  kind: 'keyword';
  value: 'none' | 'inherit' | 'initial' | 'unset';
}

// A full track list composed of segments
export interface IGridTemplateTrackList {
  kind: 'track-list';
  segments: TGridTemplateSegment[];
}

export type TGridTemplateValue = string | IGridTemplatePreset;

export type TGridTemplateParams = {
  [K in TScreenSize]?: TGridTemplateValue;
};

// Type guard for template preset
function isGridTemplatePreset(value: unknown): value is IGridTemplatePreset {
  return !!value && typeof value === 'object' && 'kind' in value;
}

// Type guard for responsive map
function isGridTemplateParams(value: unknown): value is TGridTemplateParams {
  if (!isObject(value)) return false;
  if ('kind' in value) return false;
  if (
    isUndefined((value as TGridTemplateParams).small) &&
    isUndefined((value as TGridTemplateParams).medium) &&
    isUndefined((value as TGridTemplateParams).large) &&
    isUndefined((value as TGridTemplateParams).xlarge) &&
    isUndefined((value as TGridTemplateParams).xxlarge) &&
    isUndefined((value as TGridTemplateParams).xxxlarge)
  ) {
    return false;
  }
  return true;
}

// Convert a track size expression to a CSS string
function stringifyTrackSize(size: TTrackSizeExpr | string): string {
  if (isString(size)) return size;

  if (size.kind === 'minmax') {
    const min = stringifyTrackSize(size.min);
    const max = stringifyTrackSize(size.max);
    return `minmax(${min}, ${max})`;
  }

  if (size.kind === 'fit-content') {
    return `fit-content(${size.value})`;
  }

  // Fallback for unexpected shapes
  return '';
}

// Convert a single template segment to a CSS fragment
function stringifyTemplateSegment(segment: TGridTemplateSegment): string {
  // Raw CSS segment
  if (isString(segment)) return segment;

  if (segment.kind === 'track') {
    const before = segment.lineNamesBefore
      ? isArray(segment.lineNamesBefore)
        ? `[${segment.lineNamesBefore.join(' ')}] `
        : `[${segment.lineNamesBefore}] `
      : '';

    const size = stringifyTrackSize(segment.size);

    const after = segment.lineNamesAfter
      ? isArray(segment.lineNamesAfter)
        ? ` [${segment.lineNamesAfter.join(' ')}]`
        : ` [${segment.lineNamesAfter}]`
      : '';

    return `${before}${size}${after}`;
  }

  if (segment.kind === 'repeat') {
    const trackSegments = isArray(segment.track) ? segment.track : [segment.track];

    const inner = trackSegments.map(stringifyTemplateSegment).filter(Boolean).join(' ');

    return `repeat(${segment.count}, ${inner})`;
  }

  // Fallback
  return '';
}

// Convert a template value (string or preset) to a CSS string
export function stringifyGridTemplateValue(value: TGridTemplateValue): string {
  // Raw CSS string directly provided
  if (isString(value)) return value;

  switch (value.kind) {
    case 'keyword':
      return value.value;
    case 'track-list':
      return value.segments.map(stringifyTemplateSegment).filter(Boolean).join(' ');
    default:
      return '';
  }
}

const GRID_SCREEN_ORDER: TScreenSize[] = ['small', 'medium', 'large', 'xlarge', 'xxlarge', 'xxxlarge'] as const;

export interface IContainerProps<
  BASE_ELEMENT extends HTMLElement = HTMLDivElement,
  LAYOUT extends TContainerLayout = TContainerLayout,
> extends IContainableProps<BASE_ELEMENT> {
  layout?: LAYOUT;
  gutter?: boolean | TSpacingSize;
  gutterX?: boolean | TSpacingSize;
  gutterY?: boolean | TSpacingSize;
  wrap?: boolean;
  scroll?: boolean;
  scrollX?: boolean;
  frame?: TFrame;
  itemAlignment?: THorizontalAlignment;
  verticalItemAlignment?: TVerticalAlignment;

  // For grid layout
  gridColumns?: LAYOUT extends 'grid' ? number : never;
  gridRows?: LAYOUT extends 'grid' ? number : never;

  // For masonry layout using CSS grid-template-* with responsive presets
  masonryTemplateColumns?: LAYOUT extends 'masonry' ? TGridTemplateValue | TGridTemplateParams : never;
  masonryTemplateRows?: LAYOUT extends 'masonry' ? TGridTemplateValue | TGridTemplateParams : never;
  masonryTemplateAreas?: LAYOUT extends 'masonry' ? TGridTemplateValue | TGridTemplateParams : never;
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
    // grid and masonry both depend on screen specification
    if (this.props.layout === 'grid' || this.props.layout === 'masonry') {
      app.$device.addListener(this);
    }
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    if (this.props.layout === 'grid' || this.props.layout === 'masonry') {
      app.$device.removeListener(this);
    }
  }

  public deviceScreenSpecificationChanged(_newSpec: IScreenSpec, _oldSpec: IScreenSpec, screenSizeChanged: boolean) {
    if (!screenSizeChanged) return;
    if (this.props.layout !== 'grid' && this.props.layout !== 'masonry') return;

    // Same behavior as for grid: force a re-render to recompute spans/templates
    this.forceUpdate();
  }

  public override renderStyle() {
    const style = super.renderStyle();

    if (this.props.layout === 'grid') {
      // Grid uses fixed number of columns/rows
      style['--mn-grid-columns'] = this.props.gridColumns || 1;
      style['--mn-grid-rows'] = this.props.gridRows || 1;
      return style;
    }

    if (this.props.layout === 'masonry') {
      // Masonry uses full grid-template-* strings with responsive configuration
      const columns = this.resolveResponsiveTemplate(this.props.masonryTemplateColumns);
      const rows = this.resolveResponsiveTemplate(this.props.masonryTemplateRows);
      const areas = this.resolveResponsiveTemplate(this.props.masonryTemplateAreas);

      if (columns) {
        // Full CSS value for grid-template-columns
        style['--mn-masonry-template-columns'] = columns;
      }
      if (rows) {
        // Full CSS value for grid-template-rows
        style['--mn-masonry-template-rows'] = rows;
      }
      if (areas) {
        // Full CSS value for grid-template-areas
        style['--mn-masonry-template-areas'] = areas;
      }

      return style;
    }

    return style;
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-container'] = true;
    if (this.props.layout) {
      classes[`mn-layout-${this.props.layout}-stack`] = true;
    }

    if (this.props.gutter) {
      classes['mn-layout-gutter'] = true;
      const gutter: TSpacingSize = isString(this.props.gutter) ? this.props.gutter : 'default';
      classes[`mn-layout-gutter-${gutter}`] = true;
    }
    if (this.props.gutterX) {
      classes['mn-layout-gutter-x'] = true;
      const gutterX: TSpacingSize = isString(this.props.gutterX) ? this.props.gutterX : 'default';
      classes[`mn-layout-gutter-x-${gutterX}`] = true;
    }
    if (this.props.gutterY) {
      classes['mn-layout-gutter-y'] = true;
      const gutterY: TSpacingSize = isString(this.props.gutterY) ? this.props.gutterY : 'default';
      classes[`mn-layout-gutter-y-${gutterY}`] = true;
    }

    if (this.props.wrap) classes['mn-layout-wrap'] = true;
    if (this.props.scroll) classes['mn-scroll'] = true;
    if (this.props.scrollX) classes['mn-scroll-x'] = true;
    if (this.props.frame) classes[`mn-frame-${this.props.frame}`] = true;

    if (this.props.verticalItemAlignment) {
      classes[`mn-layout-item-valign-${this.props.verticalItemAlignment}`] = true;
    }
    if (this.props.itemAlignment) {
      classes[`mn-layout-item-align-${this.props.itemAlignment}`] = true;
    }
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
    if (this.props.layout !== 'grid' && this.props.layout !== 'masonry') {
      return super.children;
    }

    if (!this.props.children) return this.props.children;

    if (!Array.isArray(this.props.children)) {
      return this.renderGridItem(this.props.children, 0);
    }

    return this.props.children.map((element: ReactNode, idx) => this.renderGridItem(element, idx));
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

    const currentScreen = app.$device.screenSpec.screenSize;
    const currentIndex = GRID_SCREEN_ORDER.indexOf(currentScreen);

    // Initialize with fallback = 1
    let colSpan = 1;
    let rowSpan = 1;

    // Single loop to resolve both column and row spans
    for (let i = 0; i <= currentIndex; i++) {
      const key = GRID_SCREEN_ORDER[i]!;

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

  protected resolveResponsiveTemplate(template?: TGridTemplateValue | TGridTemplateParams): string | undefined {
    // No template, nothing to apply
    if (!template) return undefined;

    // Direct string or direct preset
    if (typeof template === 'string' || isGridTemplatePreset(template)) {
      return stringifyGridTemplateValue(template as TGridTemplateValue);
    }

    // Responsive map keyed by screen sizes
    if (isGridTemplateParams(template)) {
      const currentScreen = app.$device?.screenSpec?.screenSize ?? 'small';
      const currentIndex = GRID_SCREEN_ORDER.indexOf(currentScreen);

      let resolved: TGridTemplateValue | undefined;

      // Same logic as colSpans / rowSpans: walk from smallest to current
      for (let i = 0; i <= currentIndex; i++) {
        const key = GRID_SCREEN_ORDER[i]!;
        const value = template[key];
        if (value != null) {
          resolved = value;
        }
      }

      return resolved ? stringifyGridTemplateValue(resolved) : undefined;
    }

    // Fallback: try to stringify as raw string (should not happen with correct typing)
    return String(template);
  }
}
