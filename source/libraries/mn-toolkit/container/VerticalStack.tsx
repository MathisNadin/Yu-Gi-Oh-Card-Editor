import { IContainerProps, IContainerState, Container } from './Container';

interface IVerticalStackProps extends IContainerProps {}
interface IVerticalStackState extends IContainerState {}

export class VerticalStack extends Container<IVerticalStackProps, IVerticalStackState> {
  public static get defaultProps(): Partial<IVerticalStackProps> {
    return {
      ...super.defaultProps,
      layout: 'vertical',
    };
  }

  public renderClasses(name?: string) {
    return super.renderClasses(name);
  }
}
