import { Container, IContainerProps, IContainerState } from '../container';

interface IContentProps extends IContainerProps {}

interface IContentState extends IContainerState {}

export class Content extends Container<IContentProps, IContentState> {
  public static get defaultProps(): Partial<IContentProps> {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      fill: true,
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
