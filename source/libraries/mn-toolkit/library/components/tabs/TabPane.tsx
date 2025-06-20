import { Container, IContainerProps, IContainerState } from '../container';
import { ITabItem, TTabPosition } from './TabSet';

export interface ITabPaneProps<ID> extends IContainerProps, ITabItem<ID> {
  tabPosition?: TTabPosition;
  isFirst?: boolean;
  isLast?: boolean;
  hidden?: boolean;
}

interface ITabPaneState extends IContainerState {}

export class TabPane<ID = number> extends Container<ITabPaneProps<ID>, ITabPaneState> {
  public static override get defaultProps(): Omit<ITabPaneProps<number>, 'tabId' | 'label'> {
    return {
      ...super.defaultProps,
      tabPosition: 'top',
      layout: 'vertical',
      fill: true,
      padding: true,
      bg: '1',
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-tab-pane'] = true;
    classes['mn-tab-pane-first'] = !!this.props.isFirst;
    classes['mn-tab-pane-last'] = !!this.props.isLast;
    if (this.props.tabPosition) classes[`mn-tab-pane-tab-position-${this.props.tabPosition}`] = true;
    classes['mn-tab-pane-hidden'] = !!this.props.hidden;
    return classes;
  }
}
