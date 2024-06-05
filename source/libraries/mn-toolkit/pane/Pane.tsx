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

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-pane'] = true;
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
}
