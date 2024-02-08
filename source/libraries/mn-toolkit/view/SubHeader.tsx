import { Container, IContainerProps, IContainerState } from '../container';

interface ISubHeaderProps extends IContainerProps {}

interface IState extends IContainerState {}

export class SubHeader extends Container<ISubHeaderProps, IState> {
  public static get defaultProps(): Partial<ISubHeaderProps> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      mainClassName: 'mn-sub-header',
      margin: false,
      gutter: true,
    };
  }

  public constructor(props: ISubHeaderProps) {
    super(props);
  }
}
