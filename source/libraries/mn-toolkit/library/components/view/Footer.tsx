import { Container, IContainerProps, IContainerState } from '../container';

export interface IFooterProps extends IContainerProps {}

interface IFooterState extends IContainerState {}

export class Footer extends Container<IFooterProps, IFooterState> {
  public static override get defaultProps(): IFooterProps {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      gutter: true,
      padding: true,
      verticalItemAlignment: 'middle',
      itemAlignment: 'right',
      bg: '2',
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-footer'] = true;
    return classes;
  }
}
