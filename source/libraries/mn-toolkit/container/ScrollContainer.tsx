import { CSSProperties, Component, ReactNode } from 'react';

const containerStyleDefault = {
  position: 'relative',
  overflow: 'hidden',
  flex: 1,
  // width: '100%',
  // height: '100%',
};

const viewStyleDefault = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  // overflow: 'scroll',
  // WebkitOverflowScrolling: 'touch',
};

const trackHorizontalStyleDefault = {
  position: 'absolute',
  height: 6,
};

const trackVerticalStyleDefault = {
  position: 'absolute',
  width: 6,
};

const thumbHorizontalStyleDefault = {
  position: 'relative',
  display: 'block',
  height: '100%',
};

const thumbVerticalStyleDefault = {
  position: 'relative',
  display: 'block',
  width: '100%',
};

const disableSelectStyleReset = {
  userSelect: '',
};

interface IValues {
  scrollLeft: number;
  scrollTop: number;
}

interface IProps {
  className: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: any;
  viewClassName: string;
  scroll?: boolean;
  scrollX?: boolean;
  children?: ReactNode;
  onContainerScroll?: (event: UIEvent) => void | Promise<void>;
  onScrollRef?: (scroller: HTMLElement) => void;
}

interface IState {}

const AUTO_HIDE_TIMEOUT = 1000;
const AUTO_HIDE_DURATION = 200;
const THUMB_MINIMUM_SIZE = 30;

export class ScrollContainer extends Component<IProps, IState> {
  public static get defaultProps(): IProps {
    return {
      className: '',
      viewClassName: '',
      scroll: true,
      style: {},
    };
  }

  private horizontalThumb!: HTMLElement;
  private verticalThumb!: HTMLElement;
  private horizontalTrack!: HTMLElement;
  private verticalTrack!: HTMLElement;
  private content!: HTMLElement;
  private trackMouseOver!: boolean;
  private dragging!: boolean;
  private prevPageX!: number;
  private prevPageY!: number;
  private hideTracksTimeout!: NodeJS.Timeout;
  private scrolling!: boolean;
  private detectScrollingInterval!: NodeJS.Timeout;
  private requestFrame!: number;
  private viewScrollLeft!: number;
  private viewScrollTop!: number;
  private lastViewScrollLeft!: number;
  private lastViewScrollTop!: number;
  private componentUpdateTimeout!: NodeJS.Timeout;

  public constructor(props: IProps) {
    super(props);
  }

  public componentDidMount() {
    this.addListeners();
    this.updateComponent();
  }

  public componentDidUpdate() {
    this.updateComponent();
  }

  private updateComponent() {
    clearTimeout(this.componentUpdateTimeout);
    this.componentUpdateTimeout = setTimeout(() => this.update());
  }

  public componentWillUnmount() {
    if (this.props.scroll) {
      this.verticalTrack.removeAttribute('style');
      this.verticalThumb.removeAttribute('style');
    }
    if (this.props.scrollX) {
      this.horizontalThumb.removeAttribute('style');
      this.horizontalTrack.removeAttribute('style');
    }
    this.removeListeners();
    cancelAnimationFrame(this.requestFrame);
    clearTimeout(this.componentUpdateTimeout);
    clearTimeout(this.hideTracksTimeout);
    clearInterval(this.detectScrollingInterval);
  }

  private getThumbHorizontalWidth() {
    const trackWidth = app.$react.getInnerWidth(this.horizontalTrack);
    const width = Math.ceil((this.content.clientWidth / this.content.scrollWidth) * trackWidth);
    if (trackWidth === width) return 0;
    return Math.max(width, THUMB_MINIMUM_SIZE);
  }

  private getThumbVerticalHeight() {
    const trackHeight = app.$react.getInnerHeight(this.verticalTrack);
    const height = Math.ceil((this.content.clientHeight / this.content.scrollHeight) * trackHeight);
    if (trackHeight === height) return 0;
    return Math.max(height, THUMB_MINIMUM_SIZE);
  }

  private getScrollLeftForOffset(offset: number) {
    const trackWidth = app.$react.getInnerWidth(this.horizontalTrack);
    const thumbWidth = this.getThumbHorizontalWidth();
    return (offset / (trackWidth - thumbWidth)) * (this.content.scrollWidth - this.content.clientWidth);
  }

  private getScrollTopForOffset(offset: number) {
    const trackHeight = app.$react.getInnerHeight(this.verticalTrack);
    const thumbHeight = this.getThumbVerticalHeight();
    return (offset / (trackHeight - thumbHeight)) * (this.content.scrollHeight - this.content.clientHeight);
  }

  private addListeners() {
    if (typeof document === 'undefined') return;
    this.onScroll = this.onScroll.bind(this);
    this.content.addEventListener('scroll', (e) => this.onScroll(e as UIEvent));
    if (!app.$react.getScrollbarSize()) return;
    this.onTrackMouseEnter = this.onTrackMouseEnter.bind(this);
    this.onTrackMouseLeave = this.onTrackMouseLeave.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    if (this.props.scrollX) {
      this.onHorizontalTrackMouseDown = this.onHorizontalTrackMouseDown.bind(this);
      this.onHorizontalThumbMouseDown = this.onHorizontalThumbMouseDown.bind(this);
      this.horizontalTrack.addEventListener('mouseenter', this.onTrackMouseEnter);
      this.horizontalTrack.addEventListener('mouseleave', this.onTrackMouseLeave);
      this.horizontalTrack.addEventListener('mousedown', this.onHorizontalTrackMouseDown);
      this.horizontalThumb.addEventListener('mousedown', this.onHorizontalThumbMouseDown);
    }
    if (this.props.scroll) {
      this.onVerticalTrackMouseDown = this.onVerticalTrackMouseDown.bind(this);
      this.onVerticalThumbMouseDown = this.onVerticalThumbMouseDown.bind(this);
      this.verticalTrack.addEventListener('mouseenter', this.onTrackMouseEnter);
      this.verticalTrack.addEventListener('mouseleave', this.onTrackMouseLeave);
      this.verticalTrack.addEventListener('mousedown', this.onVerticalTrackMouseDown);
      this.verticalThumb.addEventListener('mousedown', this.onVerticalThumbMouseDown);
    }
    window.addEventListener('resize', this.onWindowResize);
  }

  private removeListeners() {
    if (typeof document === 'undefined') return;
    this.content.removeEventListener('scroll', (e) => this.onScroll(e as UIEvent));
    if (!app.$react.getScrollbarSize()) return;
    if (this.props.scrollX) {
      this.horizontalTrack.removeEventListener('mouseenter', this.onTrackMouseEnter);
      this.horizontalTrack.removeEventListener('mouseleave', this.onTrackMouseLeave);
      this.horizontalTrack.removeEventListener('mousedown', this.onHorizontalTrackMouseDown);
      this.horizontalThumb.removeEventListener('mousedown', this.onHorizontalThumbMouseDown);
    }
    if (this.props.scroll) {
      this.verticalTrack.removeEventListener('mouseenter', this.onTrackMouseEnter);
      this.verticalTrack.removeEventListener('mouseleave', this.onTrackMouseLeave);
      this.verticalTrack.removeEventListener('mousedown', this.onVerticalTrackMouseDown);
      this.verticalThumb.removeEventListener('mousedown', this.onVerticalThumbMouseDown);
    }
    window.removeEventListener('resize', this.onWindowResize);
    this.stopDragging();
  }

  private onScroll(event: UIEvent) {
    this.update((values) => {
      this.viewScrollLeft = values.scrollLeft;
      this.viewScrollTop = values.scrollTop;
    });
    if (this.props.onContainerScroll && event) {
      app.$errorManager.handlePromise(this.props.onContainerScroll(event));
    }
    this.detectScrolling();
  }

  private onWindowResize() {
    this.update();
  }

  private onHorizontalTrackMouseDown(event: MouseEvent) {
    event.preventDefault();
    const targetLeft = (event.target as HTMLElement).getBoundingClientRect().left;
    const thumbWidth = this.getThumbHorizontalWidth();
    const offset = Math.abs(targetLeft - event.clientX) - thumbWidth / 2;
    this.content.scrollLeft = this.getScrollLeftForOffset(offset);
  }

  private onVerticalTrackMouseDown(event: MouseEvent) {
    event.preventDefault();
    const targetTop = (event.target as HTMLElement).getBoundingClientRect().top;
    const thumbHeight = this.getThumbVerticalHeight();
    const offset = Math.abs(targetTop - event.clientY) - thumbHeight / 2;
    this.content.scrollTop = this.getScrollTopForOffset(offset);
  }

  private onHorizontalThumbMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.startDragging(event);
    const { target, clientX } = event;
    const { offsetWidth } = target as HTMLElement;
    const { left } = (target as HTMLElement).getBoundingClientRect();
    this.prevPageX = offsetWidth - (clientX - left);
  }

  private onVerticalThumbMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.startDragging(event);
    const { target, clientY } = event;
    const { offsetHeight } = target as HTMLElement;
    const { top } = (target as HTMLElement).getBoundingClientRect();
    this.prevPageY = offsetHeight - (clientY - top);
  }

  private stopDragging() {
    document.body.style.userSelect = disableSelectStyleReset.userSelect;
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.onDragEnd);
    document.onselectstart = null;
  }

  private startDragging(event: MouseEvent) {
    event.stopImmediatePropagation();
    this.dragging = true;
    document.body.style.userSelect = 'none';
    this.onDrag = this.onDrag.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('mouseup', this.onDragEnd);
    document.onselectstart = () => false;
  }

  private onDrag(event: MouseEvent) {
    if (this.prevPageX) {
      const trackLeft = this.horizontalTrack.getBoundingClientRect().left;
      const thumbWidth = this.getThumbHorizontalWidth();
      const clickPosition = thumbWidth - this.prevPageX;
      const offset = -trackLeft + event.clientX - clickPosition;
      this.content.scrollLeft = this.getScrollLeftForOffset(offset);
    }
    if (this.prevPageY) {
      const trackTop = this.verticalTrack.getBoundingClientRect().top;
      const thumbHeight = this.getThumbVerticalHeight();
      const clickPosition = thumbHeight - this.prevPageY;
      const offset = -trackTop + event.clientY - clickPosition;
      this.content.scrollTop = this.getScrollTopForOffset(offset);
    }
    return false;
  }

  private onDragEnd() {
    this.dragging = false;
    // eslint-disable-next-line no-multi-assign
    this.prevPageX = this.prevPageY = 0;
    this.stopDragging();
    this.hideTracks();
  }

  private onTrackMouseEnter() {
    this.trackMouseOver = true;
    this.showTracks();
  }

  private onTrackMouseLeave() {
    this.trackMouseOver = false;
    this.hideTracks();
  }

  private showTracks() {
    clearTimeout(this.hideTracksTimeout);
    if (this.props.scrollX) this.horizontalTrack.style.opacity = '1';
    if (this.props.scroll) this.verticalTrack.style.opacity = '1';
  }

  private hideTracks() {
    if (this.dragging) return;
    if (this.scrolling) return;
    if (this.trackMouseOver) return;
    clearTimeout(this.hideTracksTimeout);
    this.hideTracksTimeout = setTimeout(() => {
      if (this.props.scrollX) this.horizontalTrack.style.opacity = '0';
      if (this.props.scroll) this.verticalTrack.style.opacity = '0';
    }, AUTO_HIDE_TIMEOUT);
  }

  private detectScrolling() {
    if (this.scrolling) return;
    this.scrolling = true;
    this.showTracks();
    this.detectScrollingInterval = setInterval(() => {
      if (this.lastViewScrollLeft === this.viewScrollLeft && this.lastViewScrollTop === this.viewScrollTop) {
        clearInterval(this.detectScrollingInterval);
        this.scrolling = false;
        this.hideTracks();
      }
      this.lastViewScrollLeft = this.viewScrollLeft;
      this.lastViewScrollTop = this.viewScrollTop;
    }, 100);
  }

  private update(callback?: (values: IValues) => void) {
    if (this.requestFrame) cancelAnimationFrame(this.requestFrame);
    this.requestFrame = requestAnimationFrame(() => {
      this.requestFrame = undefined as unknown as number;
      this._update((values) => !!callback && callback(values));
    });
  }

  private _update(callback: (values: IValues) => void) {
    if (app.$react.getScrollbarSize()) {
      if (this.props.scrollX) {
        const trackHorizontalWidth = app.$react.getInnerWidth(this.horizontalTrack);
        const thumbHorizontalWidth = this.getThumbHorizontalWidth();
        const thumbHorizontalX =
          (this.content.scrollLeft / (this.content.scrollWidth - this.content.clientWidth)) *
          (trackHorizontalWidth - thumbHorizontalWidth);
        const thumbHorizontalStyle = {
          width: thumbHorizontalWidth,
          transform: `translateX(${thumbHorizontalX}px)`,
        };
        const trackHorizontalStyle = {
          visibility: this.content.scrollWidth > this.content.clientWidth ? 'visible' : 'hidden',
        };
        app.$react.setStyle(this.horizontalTrack, trackHorizontalStyle);
        app.$react.setStyle(this.horizontalThumb, thumbHorizontalStyle);
      }

      if (this.props.scroll) {
        const trackVerticalHeight = app.$react.getInnerHeight(this.verticalTrack);
        const thumbVerticalHeight = this.getThumbVerticalHeight();
        const thumbVerticalY =
          (this.content.scrollTop / (this.content.scrollHeight - this.content.clientHeight)) *
          (trackVerticalHeight - thumbVerticalHeight);
        const thumbVerticalStyle = {
          height: thumbVerticalHeight,
          transform: `translateY(${thumbVerticalY}px)`,
        };
        const trackVerticalStyle = {
          visibility: this.content.scrollHeight > this.content.clientHeight ? 'visible' : 'hidden',
        };
        app.$react.setStyle(this.verticalTrack, trackVerticalStyle);
        app.$react.setStyle(this.verticalThumb, thumbVerticalStyle);
      }
    }
    if (!!callback) callback({ scrollLeft: this.content.scrollLeft, scrollTop: this.content.scrollTop });
  }

  public render() {
    const scrollBarSize = app.$react.getScrollbarSize();
    const containerStyle = { ...containerStyleDefault, ...this.props.style };
    const viewStyle = {
      ...viewStyleDefault,
      marginBottom: 0,
      marginRight: 0,
      overflowX: 'hidden',
      overflowY: 'hidden',
    } as CSSProperties;
    // Ici réside la magie : on cache les scrollbars natives par une marge négative
    if (this.props.scroll) {
      viewStyle.marginRight = scrollBarSize ? -scrollBarSize - 1 : 0;
      viewStyle.overflowY = 'scroll';
    }
    if (this.props.scrollX) {
      viewStyle.marginBottom = scrollBarSize ? -scrollBarSize - 1 : 0;
      viewStyle.overflowX = 'scroll';
    }

    const trackAutoHeightStyle = {
      transition: `opacity ${AUTO_HIDE_DURATION}ms`,
      opacity: 0,
    } as CSSProperties;

    const horizontalTrackStyle = {
      ...trackHorizontalStyleDefault,
      ...trackAutoHeightStyle,
      ...(!scrollBarSize && { display: 'none' }),
      right: 2,
      bottom: 2,
      left: 2,
      borderRadius: 3,
    } as CSSProperties;

    const trackVerticalStyle = {
      ...trackVerticalStyleDefault,
      ...trackAutoHeightStyle,
      ...(!scrollBarSize && { display: 'none' }),
      right: 2,
      bottom: 2,
      top: 2,
      borderRadius: 3,
    } as CSSProperties;

    const horizontalThumbStyle = {
      ...thumbHorizontalStyleDefault,
      cursor: 'pointer',
      borderRadius: 'inherit',
      backgroundColor: 'rgba(0,0,0,.2)',
    } as CSSProperties;

    const verticalThumbStyle = {
      ...thumbVerticalStyleDefault,
      cursor: 'pointer',
      borderRadius: 'inherit',
      backgroundColor: 'rgba(0,0,0,.2)',
    } as CSSProperties;

    return (
      <div className={`mn-scroller-container ${this.props.className}`} style={containerStyle}>
        <div
          className={`mn-scroller-view ${this.props.viewClassName}`}
          style={viewStyle}
          ref={(r: HTMLDivElement) => {
            this.content = r;
            if (this.props.onScrollRef) this.props.onScrollRef(r);
          }}
        >
          {this.props.children}
        </div>
        {this.props.scrollX && (
          <div
            className='mn-scroller-horizontal-track'
            ref={(r: HTMLDivElement) => (this.horizontalTrack = r)}
            style={horizontalTrackStyle}
          >
            <div
              className='mn-scroller-horizontal-thumn'
              ref={(r: HTMLDivElement) => (this.horizontalThumb = r)}
              style={horizontalThumbStyle}
            />
          </div>
        )}

        {this.props.scroll && (
          <div
            className='mn-scroller-vertical-track'
            ref={(r: HTMLDivElement) => (this.verticalTrack = r)}
            style={trackVerticalStyle}
          >
            <div
              className='mn-scroller-vertical-thumb'
              ref={(r: HTMLDivElement) => {
                this.verticalThumb = r;
              }}
              style={verticalThumbStyle}
            />
          </div>
        )}
      </div>
    );
  }
}
