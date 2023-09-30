import './styles.css';
import { IContainerProps, IContainerState, Container } from "libraries/mn-toolkit/container/Container";
import { classNames } from "libraries/mn-tools";
import { ITabSetProps, TabPosition, TabSet, ITabItem } from "./TabSet";
import { ReactNode } from "react";
import { Spinner } from 'libraries/mn-toolkit/spinner/Spinner';

type INodeWithProps = ReactNode & {
  props: any;
}

interface ITabbedPaneProps extends IContainerProps, ITabSetProps {
  tabPosition?: TabPosition;
}

interface ITabbedPaneState extends IContainerState {
  value: string;
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
export class TabbedPane extends Container<ITabbedPaneProps, ITabbedPaneState> {

  public constructor(props: ITabbedPaneProps) {
    super(props);
    this.state = {
      loaded: true,
      value: this.props.defaultValue,
    };
  }

  public static get defaultProps(): Partial<ITabbedPaneProps> {
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

  public componentWillReceiveProps(props: ITabbedPaneProps) {
    this.setState({ value: props.defaultValue });
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

    return <div
      id={this.props.nodeId}
      // name={this.props.name as string}
      className={classNames(
        this.renderClasses('mn-tabbed-pane'),
        { 'mn-disable': this.props.disabled },
      )}>
      <TabSet
        items={(this.props.children as ReactNode[]).filter(node => !!node && !(node as INodeWithProps).props.hidden).map(node => {
          return {
            id: ((node as INodeWithProps).props as ITabItem).id,
            label: ((node as INodeWithProps).props as ITabItem).label,
            // icon: ((node as INodeWithProps).props as ITabItem).icon,
            // iconColor: ((node as INodeWithProps).props as ITabItem).iconColor,
            stateIcon: ((node as INodeWithProps).props as ITabItem).stateIcon,
            stateIconColor: ((node as INodeWithProps).props as ITabItem).stateIconColor,
            badge: ((node as INodeWithProps).props as ITabItem).badge,
            onTap: ((node as INodeWithProps).props as ITabItem).onTap,
            selected: ((node as INodeWithProps).props as ITabItem).selected,
            disabled: ((node as INodeWithProps).props as ITabItem).disabled,
            closable: ((node as INodeWithProps).props as ITabItem).closable,
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
        onChange={(value: string) => this.onChange(value)}
      />
      <Container className="mn-tab-panes" fill>
        {x}
      </Container>
    </div>;
  }


/*   private onAdd(): void {
    if (this.props.onAdd) app.$errorManager.handlePromise(this.props.onAdd());
  } */

  private onClose(id: string) {
    if (this.props.onClose) app.$errorManager.handlePromise(this.props.onClose(id));
  }

  public onChange(value: string) {
    this.setState({ value });
    if (this.props.onChange) app.$errorManager.handlePromise(this.props.onChange(value));
  }


}
