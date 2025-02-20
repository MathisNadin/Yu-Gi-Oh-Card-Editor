import { IContainerProps, IContainerState, Container } from '../container';

export interface IPaneProps extends IContainerProps {
  position: 'left' | 'top' | 'bottom' | 'right';
}

export interface IPaneState extends IContainerState {}

export class Pane<P extends IPaneProps, S extends IPaneState> extends Container<P, S> {
  public static override get defaultProps(): IPaneProps {
    return {
      ...super.defaultProps,
      gutter: false,
      padding: true,
      bg: '1',
      position: 'left',
      layout: undefined,
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-pane'] = true;
    if (!this.props.layout) {
      classes['mn-layout-horizontal-stack'] = false;
      classes['mn-layout-vertical-stack'] = false;
      if (this.props.position === 'bottom' || this.props.position === 'top') {
        classes['mn-layout-horizontal-stack'] = true;
      } else if (this.props.position === 'left' || this.props.position === 'right') {
        classes['mn-layout-vertical-stack'] = true;
      }
    }
    if (this.props.position) classes[`mn-pane-${this.props.position}`] = true;
    return classes;
  }
}
