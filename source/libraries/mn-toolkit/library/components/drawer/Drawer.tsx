import { TJSXElementChildren } from '../../system';
import { IContainerProps, IContainerState, Container } from '../container';

export type TDrawerOrientation = 'left' | 'right' | 'top' | 'bottom';

export interface IDrawerProps extends IContainerProps {
  key?: string;
  orientation?: TDrawerOrientation;
  content: TJSXElementChildren;
  onRef?: (ref: Drawer) => void;
}

export interface IDrawerState extends IContainerState {
  visible: boolean;
  hidding: boolean;
}

export class Drawer<P extends IDrawerProps = IDrawerProps, S extends IDrawerState = IDrawerState> extends Container<
  P,
  S
> {
  public static override get defaultProps(): Omit<IDrawerProps, 'content'> {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      gutter: true,
      padding: true,
      scroll: true,
      bg: '1',
      zIndex: 'drawer',
      orientation: 'left',
    };
  }

  public constructor(props: P) {
    super(props);
    this.state = {
      ...this.state,
      loaded: true,
      visible: false,
      hidding: false,
    } as S;
  }

  public override componentDidMount() {
    super.componentDidMount();
    requestAnimationFrame(() => requestAnimationFrame(() => this.setState({ visible: true })));
  }

  public async close() {
    await app.$device.keyboardClose();
    await this.setStateAsync({ hidding: true });
    setTimeout(() => {
      app.$drawer.remove(this.props.id!);
    }, 200);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-drawer'] = true;
    if (this.props.orientation) classes[`${this.props.orientation}-drawer`] = true;
    classes['visible'] = this.state.visible;
    classes['hidding'] = this.state.hidding;
    return classes;
  }

  public override get children() {
    return this.props.content;
  }
}
