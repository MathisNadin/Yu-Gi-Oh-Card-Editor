import { integer, classNames } from 'mn-tools';
import { Component, createRef } from 'react';
import { IDrawerProps, IDrawer } from '.';
import { IDeviceListener } from '../device';
import { IOverlayListener } from '../overlay';

interface IDrawerState {
  active: boolean;
}

export class LeftDrawer
  extends Component<IDrawerProps, IDrawerState>
  implements IDrawer, Partial<IDeviceListener>, Partial<IOverlayListener>
{
  private element = createRef<HTMLDivElement>();
  private position!: number;
  private _active!: boolean;

  public static get defaultProps(): Partial<IDrawerProps> {
    return {
      overlay: true,
      closeWithOverlay: true,
      closeOnClick: false,
      handleSize: 10,
      handleLabel: '',
      expanded: false,
      smallDeviceWidth: '90%',
      mediumDeviceWidth: '150px',
    };
  }

  public get hasClass() {
    return false;
  }

  public constructor(props: IDrawerProps) {
    super(props);
    app.$drawer.registerPane(this);
    app.$device.addListener(this);
    app.$overlay.addListener(this);

    if (props.expanded) {
      setTimeout(() => this.expand(), 1000);
    }
  }

  public override componentWillUnmount() {
    if (super.componentWillUnmount) super.componentWillUnmount();
    app.$drawer.unregisterPane(this);
    app.$device.removeListener(this);
    app.$overlay.removeListener(this);
  }

  public overlayClick() {
    // console.log('Click on overlay');
    if (this._active && this.props.closeWithOverlay) this.retract();
  }

  public deviceScreenSpecificationChanged(): void {
    // console.log('$device::screenSpecChanged');
    this.refresh();
    this.retract();
  }

  private showOverlay(x: boolean) {
    if (x && this.props.overlay) {
      app.$overlay.show();
    } else {
      app.$overlay.hide();
    }
  }

  public toggle() {
    if (this._active) {
      this.retract();
    } else {
      this.expand();
    }
  }

  public refresh() {
    this.setPosition(0);
  }

  public get isActive() {
    return this._active;
  }

  public useEffect() {
    requestAnimationFrame(() => {
      this.refresh();
    });
  }

  private CssWidthToPixel(width: string) {
    let match = /^\s*(\d+)px\s*$/.exec(width);
    if (match) {
      return integer(match[1]);
    } else {
      match = /^\s*(\d+)%\s*$/.exec(width);
      if (match) {
        return (integer(match[1]) * app.$device.screenWidth) / 100;
      } else {
        throw new Error(`format inconnu ${width}`);
      }
    }
  }
  private get pixelWidth() {
    return this.CssWidthToPixel(this.width);
  }

  private get width() {
    if (app.$device.isSmallScreen) {
      return this.props.smallDeviceWidth;
    } else {
      return this.props.mediumDeviceWidth;
    }
  }

  private setPosition(position: number) {
    this.position = position;
    if (this.position > this.pixelWidth) this.position = this.pixelWidth;
    if (this.element?.current?.style)
      this.element.current.style.transform = `translateX(${-this.pixelWidth + this.position}px)`;
    // this.updateOverlay(this.position / this.width);
  }

  public retract() {
    if (!this._active) return;
    this._active = false;
    this.showOverlay(false);
    this.position = 0;
    this.element?.current?.classList.remove('active');
    app.$drawer.fireClose(this);
  }

  public expand() {
    if (this._active) return;
    this.showOverlay(true);
    this.position = this.pixelWidth;
    this._active = true;
    this.element?.current?.classList.add('active');
  }

  public get inside() {
    return <div className='mn-container-inside'>{this.props.children}</div>;
  }

  public override render() {
    let handleStyle = {
      right: `${-(this.props.handleSize as number)}px`,
      width: `${this.props.handleSize}px`,
    };
    return (
      <div
        ref={this.element}
        style={{ width: this.width }}
        className={classNames(
          { active: this.state.active },
          'mn-drawer',
          'mn-drawer-left',
          'mn-layout-vertical-stack',
          this.props.className
        )}
      >
        {this.inside}
        <div
          className='handle'
          style={handleStyle}
          onClick={(_e) => {
            if (this.props.onTap) this.props.onTap(this);
          }}
        >
          {this.props.handleLabel ? <span className='label'>{this.props.handleSize}</span> : null}
        </div>
      </div>
    );
  }
}
