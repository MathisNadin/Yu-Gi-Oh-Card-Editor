import { JSXElementChildren } from '../react';
import { Containable, IContainableProps, IContainableState } from '../containable';

interface ISpinnerProps extends IContainableProps {
  fullscreen?: boolean;
  overlay?: boolean;
}

interface ISpinnerState extends IContainableState {}

export class Spinner extends Containable<ISpinnerProps, ISpinnerState> {
  public constructor(props: ISpinnerProps) {
    super(props);
    this.state = {
      loaded: true,
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-spinner'] = true;
    classes['mn-fullscreen'] = !!this.props.fullscreen;
    classes['mn-spinner-overlay'] = !!this.props.overlay;
    return classes;
  }

  public renderStyle() {
    const style = super.renderStyle();
    style.width = 200;
    style.height = 200;
    return style;
  }

  public override get children(): JSXElementChildren {
    return <div className='spinner-circle' />;
  }
}
