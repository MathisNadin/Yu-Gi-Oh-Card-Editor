import { classNames } from 'mn-tools';
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
  public static get defaultProps(): Partial<ITabPaneProps<number>> {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      fill: true,
      padding: true,
      bg: '1',
    };
  }

  public renderClasses(): { [name: string]: boolean } {
    const classes = super.renderClasses();
    classes['mn-tab-pane'] = true;
    classes['mn-tab-pane-first'] = !!this.props.isFirst;
    classes['mn-tab-pane-last'] = !!this.props.isLast;
    classes[`mn-tab-pane-tab-position-${this.props.tabPosition}`] = true;
    return classes;
  }
}
