import { IContainerProps, IContainerState, Container } from '../container';

export interface IPaneProps extends IContainerProps {
  position: 'left' | 'top' | 'bottom' | 'right';
}

export interface IPaneState extends IContainerState {}

export class Pane<P extends IPaneProps, S extends IPaneState> extends Container<P, S> {
  public static get defaultProps(): Partial<IPaneProps> {
    return {
      ...super.defaultProps,
      gutter: false,
      padding: true,
      position: 'left',
      layout: undefined,
    };
  }

  public constructor(props: P) {
    super(props);
  }

  public renderClasses(name: string): { [k: string]: boolean } {
    const classes = super.renderClasses(name);
    if (!this.props.layout) {
      classes['mn-layout-horizontal-stack'] = false;
      classes['mn-layout-vertical-stack'] = false;
      if (this.props.position === 'bottom' || this.props.position === 'top')
        classes['mn-layout-horizontal-stack'] = true;
      if (this.props.position === 'left' || this.props.position === 'right') classes['mn-layout-vertical-stack'] = true;
    }
    classes[`mn-pane-${this.props.position}`] = true;
    return classes;
  }

  public render() {
    return this.renderAttributes(<div>{this.props.children}</div>, 'mn-pane');
  }
}
