import { Container, IContainerProps, IContainerState } from './Container';

interface IGroupProps extends IContainerProps {}

interface IGroupState extends IContainerState {}

export class Group extends Container<IGroupProps, IGroupState> {
  public static get defaultProps(): Partial<IGroupProps> {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      padding: true,
      gutter: true,
    };
  }
}
