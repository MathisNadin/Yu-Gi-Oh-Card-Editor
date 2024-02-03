import {
  IContainerProps,
  IContainerState,
  Container
} from 'libraries/mn-toolkit/container';
import { classNames } from 'libraries/mn-tools';
import { ITabItem, TabPosition } from './TabSet';

interface ITabPaneProps<TAbstractTabIndex>
  extends Omit<IContainerProps, 'id'>,
    ITabItem<TAbstractTabIndex> {
  tabPosition?: TabPosition;
  isFirst?: boolean;
  isLast?: boolean;
  hidden?: boolean;
}

interface ITabPaneState extends IContainerState {}

export class TabPane<TAbstractTabIndex extends string> extends Container<
  Omit<ITabPaneProps<TAbstractTabIndex>, 'id'> & { id: TAbstractTabIndex },
  ITabPaneState
> {
  public constructor(
    props: Omit<ITabPaneProps<TAbstractTabIndex>, 'id'> & {
      id: TAbstractTabIndex;
    }
  ) {
    super(props);
  }

  public static get defaultProps(): Partial<Omit<ITabPaneProps<string>, 'id'>> {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      fill: true
    };
  }

  public render() {
    return this.renderAttributes(
      <div className={classNames(
          `mn-tab-pane-${this.props.nodeId}`,
          {
            'mn-tab-pane-first': this.props.isFirst,
            'mn-tab-pane-last': this.props.isLast
          },
          `mn-tab-pane-tab-position-${this.props.tabPosition}`
        )}
      >
        {this.props.children}
    </div>, 'mn-tab-pane');
  }
}
