import { Container, IContainerProps, IContainerState } from '../container';
import { classNames } from 'libraries/mn-tools';

interface IViewProps extends IContainerProps { }

interface IViewState extends IContainerState { }

export class View extends Container<IViewProps, IViewState> {

  public static get defaultProps() : Partial<IViewProps> {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      fill: true,
    };
  }

  public constructor(props: IViewProps) {
    super(props);
  }

  public render() {
    return <div id={this.props.nodeId} className={classNames(this.renderClasses('mn-view'))}>
      {this.props.children}
    </div>;
  }

}
