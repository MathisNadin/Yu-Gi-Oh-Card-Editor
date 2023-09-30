import './styles.css';
import { IContainerProps, IContainerState, Container } from "libraries/mn-toolkit/container/Container";
import { classNames } from "libraries/mn-tools";
import { ITabItem, TabPosition } from "./TabSet";

interface ITabPaneProps extends IContainerProps, ITabItem {
  tabPosition?: TabPosition;
  isFirst?: boolean;
  isLast?: boolean;
  hidden?: boolean;
}

interface ITabPaneState extends IContainerState {
}

export class TabPane extends Container<ITabPaneProps, ITabPaneState> {

  public constructor(props: ITabPaneProps) {
    super(props);
  }

  public static get defaultProps(): Partial<ITabPaneProps> {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      fill: true,
    };
  }

  public render() {
    return this.renderAttributes(<div
      className={classNames(`mn-tab-pane-${this.props.nodeId}`,
        {
          'mn-tab-pane-first': this.props.isFirst,
          'mn-tab-pane-last': this.props.isLast
        },
        `mn-tab-pane-tab-position-${this.props.tabPosition}`)}>{this.props.children}</div>, 'mn-tab-pane');
  }

}
