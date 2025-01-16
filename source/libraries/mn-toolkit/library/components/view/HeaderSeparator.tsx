import { Containable, IContainableProps, IContainableState } from '../containable';

interface IHeaderSeparatorProps extends IContainableProps {}

interface IHeaderSeparatorState extends IContainableState {}

export class HeaderSeparator extends Containable<IHeaderSeparatorProps, IHeaderSeparatorState> {
  public constructor(props: IHeaderSeparatorProps) {
    super(props);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-header-separator'] = true;
    return classes;
  }

  public override get children() {
    return null;
  }
}
