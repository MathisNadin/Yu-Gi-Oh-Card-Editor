import { createRef } from 'react';
import { IDeviceListener, IScreenSpec } from '../../system';
import { IPaneProps, IPaneState, Pane } from '../pane';

interface IStickyPaneProps extends IPaneProps {}

interface IStickyPaneState extends IPaneState {
  sticky: boolean;
  stickyState?: 'sticky-visible' | 'sticky-hidden';
}

export class StickyPane extends Pane<IStickyPaneProps, IStickyPaneState> implements Partial<IDeviceListener> {
  private contentRef = createRef<HTMLDivElement>();

  // Reference to the scrollable container (the one that contains this StickyPane)
  private scrollContainer: HTMLElement | null = null;

  // Stores the content height and width to keep the placeholder size consistent
  private contentHeight = 0;
  private contentWidth = 0;

  // Track the last known scroll positions
  private lastScrollY = 0;
  private lastScrollX = 0;

  public static override get defaultProps(): IStickyPaneProps {
    return {
      ...super.defaultProps,
      padding: false,
      position: 'top',
    };
  }

  public constructor(props: IStickyPaneProps) {
    super(props);
    this.state = {
      ...this.state,
      sticky: false,
      stickyState: undefined,
    };
    app.$device.addListener(this);
  }

  public override componentDidMount() {
    super.componentDidMount();

    this.setContentSizes();

    // Find the scrollable parent container (traverse up the DOM tree)
    this.scrollContainer = this.getScrollParent(this.base.current);
    if (!this.scrollContainer) return;

    // Initialize last scroll position
    this.lastScrollY = this.scrollContainer.scrollTop;
    this.lastScrollX = this.scrollContainer.scrollLeft;
    this.scrollContainer.addEventListener('scroll', this.handleScroll);

    // Initial check
    this.handleScroll();
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    app.$device.removeListener(this);
    if (!this.scrollContainer) return;
    this.scrollContainer.removeEventListener('scroll', this.handleScroll);
  }

  // Let the container take its new default size, and then reset the height and width
  public deviceScreenSpecificationChanged(_newSpec: IScreenSpec, _oldSpec: IScreenSpec) {
    this.contentHeight = 0;
    this.contentWidth = 0;
    this.forceUpdate(() => {
      this.setContentSizes();
      this.forceUpdate();
    });
  }

  // Measure the content size to fix the placeholder (prevents layout shifts when the content becomes sticky)
  private setContentSizes() {
    if (!this.contentRef.current) return;
    const rect = this.contentRef.current.getBoundingClientRect();
    this.contentHeight = rect.height;
    this.contentWidth = rect.width;
  }

  /**
   * Finds the closest scrollable parent.
   * This function iterates through parent elements to find one with "auto" or "scroll" overflow.
   */
  private getScrollParent(element: HTMLElement | null): HTMLElement | null {
    if (!element) return null;

    let style = getComputedStyle(element);
    if (style.position === 'fixed') return document.body;

    const overflowRegex = /(auto|scroll)/;
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      style = getComputedStyle(parent);
      if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) {
        return parent;
      }
    }

    return document.body;
  }

  /**
   * Handles the scroll event according to the following logic:
   *
   * 1. When not in sticky mode:
   *    - If at least one pixel of the base element is visible, remain non-sticky.
   *    - If the base element is not visible at all and the user is scrolling toward the StickyPane,
   *      switch to sticky mode with stickyState set to "sticky-visible".
   *
   * 2. When in sticky mode:
   *    - If the base element becomes fully visible, revert to non-sticky.
   *    - Otherwise, update stickyState based on scroll direction:
   *         - For a "top" pane: scrolling downward → "sticky-hidden", otherwise "sticky-visible".
   *         - For a "bottom" pane: scrolling upward → "sticky-hidden", otherwise "sticky-visible".
   *         - For a "left" pane: scrolling right → "sticky-hidden", otherwise "sticky-visible".
   *         - For a "right" pane: scrolling left → "sticky-hidden", otherwise "sticky-visible".
   */
  private handleScroll = () => {
    if (!this.base.current || !this.scrollContainer) return;

    const placeholderRect = this.base.current.getBoundingClientRect();
    const containerRect = this.scrollContainer.getBoundingClientRect();

    const currentScrollY = this.scrollContainer.scrollTop;
    const currentScrollX = this.scrollContainer.scrollLeft;

    // Determine scroll direction.
    const scrollingUpwards = currentScrollY < this.lastScrollY;
    const scrollingDownwards = currentScrollY > this.lastScrollY;
    const scrollingLeft = currentScrollX < this.lastScrollX;
    const scrollingRight = currentScrollX > this.lastScrollX;

    let newSticky = this.state.sticky;
    let newStickyState = this.state.stickyState;
    const position = this.props.position;

    // Determine if the base element is fully visible.
    const fullyVisible =
      placeholderRect.top >= containerRect.top &&
      placeholderRect.bottom <= containerRect.bottom &&
      placeholderRect.left >= containerRect.left &&
      placeholderRect.right <= containerRect.right;

    // Determine if the base element is not visible at all (no intersection).
    const notVisible =
      placeholderRect.bottom <= containerRect.top ||
      placeholderRect.top >= containerRect.bottom ||
      placeholderRect.right <= containerRect.left ||
      placeholderRect.left >= containerRect.right;

    if (fullyVisible) {
      // If the base element is fully visible, disable sticky mode.
      newSticky = false;
      newStickyState = undefined;
    } else {
      // If not fully visible:
      if (!this.state.sticky) {
        // When not in sticky mode, only switch to sticky if the base element is completely not visible.
        if (notVisible) {
          switch (position) {
            case 'top':
              newSticky = scrollingUpwards ? true : false;
              newStickyState = scrollingUpwards ? 'sticky-visible' : undefined;
              break;
            case 'bottom':
              newSticky = scrollingDownwards ? true : false;
              newStickyState = scrollingDownwards ? 'sticky-visible' : undefined;
              break;
            case 'left':
              newSticky = scrollingLeft ? true : false;
              newStickyState = scrollingLeft ? 'sticky-visible' : undefined;
              break;
            case 'right':
              newSticky = scrollingRight ? true : false;
              newStickyState = scrollingRight ? 'sticky-visible' : undefined;
              break;
            default:
              break;
          }
        } else {
          // If at least one pixel is still visible, remain non-sticky.
          newSticky = false;
          newStickyState = undefined;
        }
      } else {
        // If already in sticky mode, update stickyState based on the scroll direction.
        switch (position) {
          case 'top':
            newStickyState = scrollingDownwards ? 'sticky-hidden' : 'sticky-visible';
            break;
          case 'bottom':
            newStickyState = scrollingUpwards ? 'sticky-hidden' : 'sticky-visible';
            break;
          case 'left':
            newStickyState = scrollingRight ? 'sticky-hidden' : 'sticky-visible';
            break;
          case 'right':
            newStickyState = scrollingLeft ? 'sticky-hidden' : 'sticky-visible';
            break;
          default:
            break;
        }
      }
    }

    if (newSticky !== this.state.sticky || newStickyState !== this.state.stickyState) {
      this.setState({ sticky: newSticky, stickyState: newStickyState });
    }

    // Update last scroll positions.
    this.lastScrollY = currentScrollY;
    this.lastScrollX = currentScrollX;
  };

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-sticky-pane'] = true;
    classes['sticky'] = this.state.sticky;
    if (this.state.sticky) {
      classes['sticky'] = true;
      if (this.state.stickyState) classes[this.state.stickyState] = true;
    }
    return classes;
  }

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    if (!this.state.sticky) return attributes;

    if (this.contentWidth) {
      attributes.style!.width = this.contentWidth;
      attributes.style!.minWidth = this.contentWidth;
      attributes.style!.maxWidth = this.contentWidth;
    }
    if (this.contentHeight) {
      attributes.style!.height = this.contentHeight;
      attributes.style!.minHeight = this.contentHeight;
      attributes.style!.maxHeight = this.contentHeight;
    }
    return attributes;
  }

  /**
   * The rendering consists of two parts:
   * - The base container that keeps the same height.
   * - The internal content, which switches position (via the "sticky" class) and animates.
   */
  public override get inside() {
    const style: { [key: string]: number | boolean | string } = {};
    if (this.props.position === 'top' || this.props.position === 'bottom') {
      if (this.contentWidth) {
        style.width = this.contentWidth;
        style.minWidth = this.contentWidth;
        style.maxWidth = this.contentWidth;
      }
    } else if (this.props.position === 'left' || this.props.position === 'right') {
      if (this.contentHeight) {
        style.height = this.contentHeight;
        style.minHeight = this.contentHeight;
        style.maxHeight = this.contentHeight;
      }
    }

    return (
      <div ref={this.contentRef} className='mn-container-inside' style={style}>
        {this.children}
      </div>
    );
  }
}
