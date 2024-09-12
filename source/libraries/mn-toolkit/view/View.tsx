import { Container, IContainerProps, IContainerState } from '../container';
import { classNames } from 'mn-tools';

interface IViewProps extends IContainerProps {}

interface IViewState extends IContainerState {}

export class View extends Container<IViewProps, IViewState> {
  public static get defaultProps(): Partial<IViewProps> {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      fill: true,
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-view'] = true;
    return classes;
  }

  public render() {
    return (
      <div id={this.props.nodeId} className={classNames(this.renderClasses())}>
        {this.inside}
      </div>
    );
  }
}
