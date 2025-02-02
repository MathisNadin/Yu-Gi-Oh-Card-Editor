import { classNames } from 'mn-tools';
import { Icon, TIconId } from '../icon';
import { IPaneProps, IPaneState, Pane } from '../pane/Pane';
import { Typography } from '../typography';

interface IMenuPaneProps extends IPaneProps {
  showIcon?: boolean;
  open?: boolean;
  dynamic?: boolean;
  showVersion?: boolean;
  onStateChanged?: (open: boolean) => void;
}

interface IMenuPaneState extends IPaneState {
  open: boolean;
}

export class MenuPane extends Pane<IMenuPaneProps, IMenuPaneState> {
  public static override get defaultProps(): IMenuPaneProps {
    return {
      ...super.defaultProps,
      showIcon: true,
      open: false,
      dynamic: false,
      layout: 'vertical',
      gutter: true,
      margin: false,
      showVersion: true,
    };
  }

  public constructor(props: IMenuPaneProps) {
    super(props);
    this.update(!!this.props.open, true);

    app.$overlay.addListener({
      overlayClick: () => {
        app.$errorManager.handlePromise(this.toggle());
      },
    });

    app.$device.addListener({
      deviceScreenSpecificationChanged: () => {
        this.update(false);
      },
    });
  }

  public get isOpened() {
    return this.state.open;
  }

  public async close() {
    await this.update(false);
  }

  public async open() {
    await this.update(true);
  }

  public async toggle() {
    await this.update(!this.state.open);
  }

  public async update(open: boolean, initial?: boolean) {
    if (initial) this.state = { ...this.state, open };
    else await this.setStateAsync({ open });

    if (app.$device.isSmallScreen) {
      if (open) {
        app.$overlay.show({ withMenuMargin: true });
      } else {
        app.$overlay.hide();
      }
    }

    setTimeout(() => {
      if (this.props.onStateChanged) this.props.onStateChanged(open);
      app.$header.update();
    }, 500);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-menu-pane'] = true;
    classes['dynamic'] = !!this.props.dynamic;
    classes['static'] = !this.props.dynamic;
    classes['open'] = this.state.open;
    classes['close'] = !this.state.open;
    return classes;
  }

  private getCloseIcon(): TIconId {
    if (!app.$device.isSmallScreen) {
      return this.state.open ? 'toolkit-angle-left' : 'toolkit-angle-right';
    }
    return 'toolkit-menu-handburger';
  }

  public get inside() {
    const hasIcon = !this.props.dynamic && !!this.props.showIcon;
    return [
      hasIcon && (
        <Icon
          key='mn-menu-pane-shrink-btn'
          className='shrink-btn'
          onTap={() => this.toggle()}
          icon={this.getCloseIcon()}
        />
      ),
      <div key='mn-menu-pane-inside' className={classNames('mn-container-inside', { 'with-icon': hasIcon })}>
        {this.props.children}
        {!!this.props.showVersion && (
          <Typography
            key='mn-menu-pane-version'
            variant='help'
            className='mn-menu-pane-version'
            content={app.version}
          />
        )}
      </div>,
    ];
  }
}
