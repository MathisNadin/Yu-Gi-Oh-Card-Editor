import { IContainerProps, IContainerState, Container } from 'libraries/mn-toolkit/container';
import { classNames } from 'libraries/mn-tools';
import { ITabSetProps, TabPosition, TabSet, ITabItem } from './TabSet';
import { ReactNode } from 'react';
import { Spinner } from 'libraries/mn-toolkit/spinner';

export type INodeWithProps = ReactNode & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any;
};

interface ITabbedPaneProps<TAbstractTabIndex> extends IContainerProps, ITabSetProps<TAbstractTabIndex> {
  tabPosition?: TabPosition;
}

interface ITabbedPaneState<TAbstractTabIndex> extends IContainerState {
  value: TAbstractTabIndex;
}

/** Create a TabSet.
 *
 * Constructor need a ITabbedPaneProps.
 * - items
 * - defaultValue
 * - ?classname
 * - ?disabled
 * - ?onChange
 */
export class TabbedPane<TAbstractTabIndex> extends Container<
  ITabbedPaneProps<TAbstractTabIndex>,
  ITabbedPaneState<TAbstractTabIndex>
> {
  public constructor(props: ITabbedPaneProps<TAbstractTabIndex>) {
    super(props);
    this.state = {
      loaded: true,
      value: this.props.defaultValue,
    };
  }

  public static get defaultProps(): Partial<ITabbedPaneProps<string>> {
    return {
      ...super.defaultProps,
      // name: '',
      className: '',
      disabled: false,
      layout: 'vertical',
      tabPosition: 'top',
      fill: true,
    };
  }

  public get tabIndex() {
    return this.state.value;
  }

  public componentDidUpdate() {
    if (this.props.defaultValue !== this.state.value) this.setState({ value: this.props.defaultValue });
  }

  public render() {
    if (!this.state?.loaded) return <Spinner />;

    let x = (this.props.children as ReactNode[]).filter((node, i) => {
      /*       console.log(node);
      if (!node || (node as INodeWithProps).props.hidden) return false;
      // (node as INodeWithProps).props.bg = this.props.bg;
      (node as INodeWithProps).props.isFirst = i === 0;
      (node as INodeWithProps).props.tabPosition = this.props.tabPosition;
      (node as INodeWithProps).props.isLast = i === ((this.props.children as any).length - 1); */
      return (node as INodeWithProps).props.id === this.state.value;
    });

    return (
      <Container
        id={this.props.nodeId}
        name={this.props.name as string}
        layout={['left', 'right'].includes(this.props.tabPosition as string) ? 'horizontal' : 'vertical'}
        className={classNames('mn-tabbed-pane', this.props.className, { 'mn-disable': this.props.disabled })}
      >
        <TabSet
          items={(this.props.children as ReactNode[])
            .filter((node) => !!node && !(node as INodeWithProps).props.hidden)
            .map((node) => {
              return {
                id: ((node as INodeWithProps).props as ITabItem<TAbstractTabIndex>).id,
                label: ((node as INodeWithProps).props as ITabItem<TAbstractTabIndex>).label,
                // icon: ((node as INodeWithProps).props as ITabItem<TAbstractTabIndex>).icon,
                // iconColor: ((node as INodeWithProps).props as ITabItem<TAbstractTabIndex>).iconColor,
                stateIcon: ((node as INodeWithProps).props as ITabItem<TAbstractTabIndex>).stateIcon,
                stateIconColor: ((node as INodeWithProps).props as ITabItem<TAbstractTabIndex>).stateIconColor,
                badge: ((node as INodeWithProps).props as ITabItem<TAbstractTabIndex>).badge,
                onTap: ((node as INodeWithProps).props as ITabItem<TAbstractTabIndex>).onTap,
                selected: ((node as INodeWithProps).props as ITabItem<TAbstractTabIndex>).selected,
                disabled: ((node as INodeWithProps).props as ITabItem<TAbstractTabIndex>).disabled,
                closable: ((node as INodeWithProps).props as ITabItem<TAbstractTabIndex>).closable,
                // selectedBg: this.props.bg,
              };
            })}
          // legend={this.props.legend}
          defaultValue={this.state.value}
          tabPosition={this.props.tabPosition}
          disabled={this.props.disabled}
          onClose={(id: string) => this.onClose(id)}
          // addButton={this.props.addButton}
          // onAdd={() => this.onAdd()}
          onChange={(value: TAbstractTabIndex) => this.onChange(value)}
        />
        <Container className='mn-tab-panes' fill>
          {x}
        </Container>
      </Container>
    );
  }

  /*   private onAdd(): void {
    if (this.props.onAdd) app.$errorManager.handlePromise(this.props.onAdd());
  } */

  private onClose(id: string) {
    if (this.props.onClose) app.$errorManager.handlePromise(this.props.onClose(id));
  }

  public onChange(value: TAbstractTabIndex) {
    this.setState({ value }, () => !!this.props.onChange && this.props.onChange(this.state.value));
  }
}
