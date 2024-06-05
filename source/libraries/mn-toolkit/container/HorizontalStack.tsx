import { IContainerProps, IContainerState, Container } from './Container';

export interface IHorizontalStackProps extends IContainerProps {}
interface IHorizontalStackState extends IContainerState {}

export class HorizontalStack extends Container<IHorizontalStackProps, IHorizontalStackState> {
  public static get defaultProps(): Partial<IHorizontalStackProps> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
    };
  }
}
