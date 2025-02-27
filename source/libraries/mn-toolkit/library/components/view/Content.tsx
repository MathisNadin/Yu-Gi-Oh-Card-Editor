import { Container, IContainerProps, IContainerState } from '../container';

export interface IContentProps extends IContainerProps {}

export interface IContentState extends IContainerState {}

export class Content<
  P extends IContentProps = IContentProps,
  S extends IContentState = IContentState,
> extends Container<P, S> {
  public static override get defaultProps(): IContentProps {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      fill: true,
      scroll: true,
      gutter: true,
      margin: false,
      padding: true,
      bg: '2',
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-content'] = true;
    return classes;
  }
}
