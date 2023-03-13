/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */
import './styles.css';
import { IContainerProps, IContainerState, Container } from 'mn-toolkit/container/Container';

interface IHorizontalStackProps extends IContainerProps {}
interface IHorizontalStackState extends IContainerState {}

export class HorizontalStack extends Container<IHorizontalStackProps, IHorizontalStackState> {

  public static get defaultProps(): Partial<IHorizontalStackProps> {
    return {
      ...super.defaultProps,
      layout: 'horizontal'
    };
  }
}
