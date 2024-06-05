import { integer, classNames } from 'mn-tools';
import { Component } from 'react';
import { IDrawerProps, IDrawer } from '.';
import { IDeviceListener } from '../device';
import { IOverlayListener } from '../overlay';

interface IDrawerState {
  active: boolean;
  position: number;
}

export class RightDrawer
  extends Component<IDrawerProps, IDrawerState>
  implements IDrawer, Partial<IDeviceListener>, Partial<IOverlayListener>
{
  public static get defaultProps(): Partial<IDrawerProps> {
    return {
      overlay: true,
      closeWithOverlay: true,
      closeOnClick: false,
      handleSize: 0,
      handleLabel: '',
      smallDeviceWidth: '90%',
      mediumDeviceWidth: '350px',
    };
  }

  public constructor(props: IDrawerProps) {
    super(props);
    app.$drawer.registerPane(this);

    app.$device.addListener(this);
    app.$overlay.addListener(this);
    this.state = { ...this.state, position: 0 };
  }

  public componentWillUnmount() {
    app.$drawer.unregisterPane(this);
    app.$device.removeListener(this);
    app.$overlay.removeListener(this);
  }

  public overlayClick() {
    // console.log('Click on overlay');
    if (this.state.active && this.props.closeWithOverlay) this.retract();
  }

  public deviceScreenSpecificationChanged(): void {
    // console.log('$device::screenSpecChanged');
    app.$overlay.hide();
    this.setState({ position: 0, active: false });
    app.$drawer.fireClose(this);
  }

  public showOverlay(x: boolean) {
    if (x && this.props.overlay) {
      app.$overlay.show();
    } else {
      app.$overlay.hide();
    }
  }

  public toggle() {
    if (this.state.active) {
      this.retract();
    } else {
      this.expand();
    }
  }

  public get isActive() {
    return this.state.active;
  }

  private positionToTranslation(position: number) {
    return app.$device.screenWidth - position;
  }

  private realWidth(width: string) {
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
  private get width() {
    let result: number;
    if (app.$device.isSmallScreen) {
      result = this.realWidth(this.props.smallDeviceWidth);
    } else {
      result = this.realWidth(this.props.mediumDeviceWidth);
    }
    return result;
  }

  public retract() {
    if (!this.state.active) return;
    this.showOverlay(false);
    this.setState({ position: 0, active: false });
    app.$drawer.fireClose(this);
  }

  public expand() {
    if (this.state.active) return;
    this.showOverlay(true);
    this.setState({ position: this.width, active: true });
  }

  public get inside() {
    return <div className='mn-container-inside'>{this.props.children}</div>;
  }

  public render() {
    let handleStyle = {
      left: `${-(this.props.handleSize as number)}px`,
      width: `${this.props.handleSize}px`,
    };
    let style = {
      width: `${this.width}px`,
      transform: `translateX(${this.positionToTranslation(this.state.position || 0)}px)`,
    };

    return (
      <div
        style={style}
        className={classNames(
          { active: this.state.active },
          'mn-drawer',
          'mn-drawer-right',
          'mn-layout-vertical-stack',
          this.props.className
        )}
      >
        {this.inside}
        <div className='handle' style={handleStyle} onClick={(_e) => this.toggle()}>
          {this.props.handleLabel ? <span className='label'>{this.props.handleLabel}</span> : null}
        </div>
      </div>
    );
  }
}
