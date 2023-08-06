/* eslint-disable no-useless-constructor */
/* eslint-disable prefer-const */
/* eslint-disable no-undef */
/* eslint-disable no-return-assign */
/* eslint-disable lines-between-class-members */
/* eslint-disable no-unused-vars */
/* eslint-disable react/self-closing-comp */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */

import './styles.css';
import { IContainerProps, IContainerState, Container } from "mn-toolkit/container/Container";
import { classNames } from "mn-toolkit/tools";
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
