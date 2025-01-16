import { Containable, IContainableProps, IContainableState } from '../../components';

interface IError404Props extends IContainableProps {}

interface IError404State extends IContainableState {}

export class Error404 extends Containable<IError404Props, IError404State> {
  public override get children() {
    return `not found ${location.pathname}`;
  }
}
