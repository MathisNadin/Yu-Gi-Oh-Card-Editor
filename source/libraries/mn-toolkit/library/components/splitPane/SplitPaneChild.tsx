import { isDefined } from 'mn-tools';
import { Containable, IContainableProps, IContainableState } from '../containable';

interface ISplitPaneChildProps extends IContainableProps {
  orientation: 'horizontal' | 'vertical';
  size?: number;
  unit: 'px' | '%';
}

interface ISplitPaneChildState extends IContainableState {}

export class SplitPaneChild extends Containable<ISplitPaneChildProps, ISplitPaneChildState> {
  public static override get defaultProps(): ISplitPaneChildProps {
    return {
      orientation: 'horizontal',
      size: 0,
      unit: 'px',
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-split-pane-child'] = true;
    classes[`mn-split-pane-child-${this.props.size ? 'master' : 'slave'}`] = true;
    return classes;
  }

  public override renderStyle() {
    const style = super.renderStyle();
    const size = this.props.size;
    const isMaster = isDefined(this.props.size);
    if (isMaster && isDefined(this.props.size)) {
      if (this.props.orientation === 'vertical') {
        style.height = `${size}${this.props.unit}`;
      } else {
        style.width = `${size}${this.props.unit}`;
      }
    }
    return style;
  }
}
