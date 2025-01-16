import { Containable, IContainableProps, IContainableState } from '../containable';

export interface ISpacerProps extends IContainableProps {}

export interface ISpacerState extends IContainableState {}

export class Spacer extends Containable<ISpacerProps, ISpacerState> {
  public static override get defaultProps(): ISpacerProps {
    return {
      ...super.defaultProps,
      fill: true,
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-layout-spacer'] = true;
    return classes;
  }
}
