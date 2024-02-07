import { Icon } from "../icon";
import { IPaneProps, IPaneState, Pane } from "../pane/Pane";

interface IMenuPaneProps extends IPaneProps {
  dark?: boolean;
  open?: boolean;
  onStateChanged?: (open: boolean) => void;
}

interface IMenuPaneState extends IPaneState {
  open: boolean;
}

export class MenuPane extends Pane<IMenuPaneProps, IMenuPaneState> {

  public static get defaultProps(): Partial<IMenuPaneProps> {
    return {
      ...super.defaultProps,
      dark: false,
      open: false,
      layout: 'vertical',
      gutter: true,
      margin: false,
    };
  }

  public constructor(props: IMenuPaneProps) {
    super(props);
    this.update(!!this.props.open);

    app.$overlay.addListener({
      overlayClick: () => {
        this.toggle();
      }
    });

    app.$device.addListener({
      deviceScreenSpecificationChanged: () => {
        this.update(false);
      }
    });
  }

  public close() {
    this.update(false);
  }

  public open() {
    this.update(true);
  }

  public toggle() {
    this.update(!this.state.open);
  }

  public update(open: boolean) {
    this.setState({ open });
    if (app.$device.isSmallScreen) {
      if (open) {
        app.$overlay.show();
      } else {
        app.$overlay.hide();
      }
    }
    setTimeout(() => {
      if (this.props.onStateChanged) this.props.onStateChanged(open);
      app.$header.update();
    }, 500);
  }

  public renderClasses(name: string) {
    return {
      ...super.renderClasses(name),
      'mn-dark-theme': !!this.props.dark,
      'mn-menu-pane-open': !!this.state.open,
    };
  }

  private getCloseIcon() {
    if (!app.$device.isSmallScreen) {
      return this.state.open ? 'toolkit-angle-left' : 'toolkit-angle-right';
    }
    return 'toolkit-close';
  }

  public render() {
    return this.renderAttributes(<div>
      <Icon className="shrink-btn" onTap={() => this.toggle()} iconId={this.getCloseIcon()} />
      {this.props.children}
    </div>, 'mn-menu-pane');
  }

}
