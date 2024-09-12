import { Container, IContainerProps, IContainerState } from '../container';

interface ISubHeaderProps extends IContainerProps {}

interface ISubHeaderState extends IContainerState {}

export class SubHeader extends Container<ISubHeaderProps, ISubHeaderState> {
  public static get defaultProps(): Partial<ISubHeaderProps> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      margin: false,
      gutter: true,
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-sub-header'] = true;
    return classes;
  }
}
