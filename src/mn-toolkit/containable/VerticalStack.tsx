/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */
import { IContainerProps, IContainerState, Container } from 'mn-toolkit/container/Container';

interface IVerticalStackProps extends IContainerProps {}
interface IVerticalStackState extends IContainerState {}

export class VerticalStack extends Container<IVerticalStackProps, IVerticalStackState> {

  public static get defaultProps(): Partial<IVerticalStackProps> {
    return {
      ...super.defaultProps,
      layout: 'vertical'
    };
  }
}
