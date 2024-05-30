import { IContainerProps, IContainerState, Container } from './Container';

export interface IVerticalStackProps extends IContainerProps {}
interface IVerticalStackState extends IContainerState {}

export class VerticalStack extends Container<IVerticalStackProps, IVerticalStackState> {
  public static get defaultProps(): Partial<IVerticalStackProps> {
    return {
      ...super.defaultProps,
      layout: 'vertical',
    };
  }
}
