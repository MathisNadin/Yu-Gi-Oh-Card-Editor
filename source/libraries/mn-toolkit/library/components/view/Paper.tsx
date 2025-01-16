import { Container, IContainerProps, IContainerState } from '../container';

interface IPaperProps extends IContainerProps {}

interface IPaperState extends IContainerState {}

export class Paper extends Container<IPaperProps, IPaperState> {
  public static override get defaultProps(): IPaperProps {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      fill: false,
      padding: true,
      gutter: true,
      margin: false,
      bg: '1',
      frame: 'shadow-1',
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-paper'] = true;
    return classes;
  }
}
