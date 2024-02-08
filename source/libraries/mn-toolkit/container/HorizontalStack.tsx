import { IContainerProps, IContainerState, Container } from './Container';

interface IHorizontalStackProps extends IContainerProps {}
interface IHorizontalStackState extends IContainerState {}

export class HorizontalStack extends Container<IHorizontalStackProps, IHorizontalStackState> {
  public static get defaultProps(): Partial<IHorizontalStackProps> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
    };
  }

  public renderClasses(name?: string) {
    return super.renderClasses(name);
  }
}
