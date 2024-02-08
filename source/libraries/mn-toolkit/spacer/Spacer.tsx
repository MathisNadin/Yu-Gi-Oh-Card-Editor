import { classNames } from 'libraries/mn-tools';
import { Containable, IContainableProps, IContainableState } from '../containable';

export interface ISpacerProps extends IContainableProps {}

export interface ISpacerState extends IContainableState {}

export class Spacer extends Containable<ISpacerProps, ISpacerState> {
  public static get defaultProps(): Partial<ISpacerProps> {
    return {
      ...super.defaultProps,
      fill: true,
    };
  }

  public render() {
    return <div className={classNames(this.renderClasses('mn-layout-spacer'))} />;
  }
}
