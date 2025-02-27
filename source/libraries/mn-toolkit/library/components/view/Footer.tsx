import { Container, IContainerProps, IContainerState } from '../container';

export interface IFooterProps extends IContainerProps {}

export interface IFooterState extends IContainerState {}

export class Footer<P extends IFooterProps = IFooterProps, S extends IFooterState = IFooterState> extends Container<
  P,
  S
> {
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
