import { IContainerProps, IContainerState, Container } from './Container';

export interface IHorizontalStackProps extends IContainerProps {}
interface IHorizontalStackState extends IContainerState {}

export class HorizontalStack extends Container<IHorizontalStackProps, IHorizontalStackState> {
  public static override get defaultProps(): IHorizontalStackProps {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
    };
  }
}
