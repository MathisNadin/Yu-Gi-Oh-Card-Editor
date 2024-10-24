import { Component, PropsWithChildren } from 'react';
import { isDefined, classNames } from 'mn-tools';

interface ISplitPaneChildProps extends PropsWithChildren {
  orientation: 'horizontal' | 'vertical';
  size?: number;
  unit: 'px' | '%';
}

interface ISplitPaneChildState {}

export class SplitPaneChild extends Component<ISplitPaneChildProps, ISplitPaneChildState> {
  public constructor(props: ISplitPaneChildProps) {
    super(props);
  }

  public override render() {
    const isMaster = isDefined(this.props.size);
    const size = this.props.size || 0;
    const style: { width?: string; height?: string } = {};
    if (isMaster) {
      if (this.props.orientation === 'vertical') {
        style.height = `${size}${this.props.unit}`;
      } else {
        style.width = `${size}${this.props.unit}`;
      }
    }
    return (
      <div
        className={classNames('mn-split-pane-child', `mn-split-pane-child-${isMaster ? 'master' : 'slave'}`)}
        style={style}
      >
        {this.props.children}
      </div>
    );
  }
}
