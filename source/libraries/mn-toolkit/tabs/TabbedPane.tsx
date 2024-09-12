import { classNames } from 'mn-tools';
import { Container, IContainerProps, IContainerState } from '../container';
import { ITabSetProps, TabSet, TTabPosition } from './TabSet';
import { ITabPaneProps, TabPane } from './TabPane';
import { JSXElementChildren } from '../react';
import { IContainableProps, TDidUpdateSnapshot } from '../containable';

export interface ITabbedPanePane<ID = number> {
  props: ITabPaneProps<ID>;
  content: JSXElementChildren;
}

interface ITabbedPaneProps<ID = number> extends IContainerProps, ITabSetProps<ID> {
  panes: ITabbedPanePane<ID>[];
  tabPosition?: TTabPosition;
  tabSetMaxWidth?: string;
  noSpacer?: boolean;
}

interface ITabbedPaneState<ID> extends IContainerState {
  value: ID;
}

export class TabbedPane<ID = number> extends Container<ITabbedPaneProps<ID>, ITabbedPaneState<ID>> {
  public static get defaultProps(): Partial<ITabbedPaneProps> {
    return {
      ...super.defaultProps,
      panes: [],
      name: '',
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

  public constructor(props: ITabbedPaneProps<ID>) {
    super(props);
    this.state = { ...this.state, value: this.props.defaultValue };
  }

  public override componentDidUpdate(
    prevProps: Readonly<ITabbedPaneProps<ID>>,
    prevState: Readonly<ITabbedPaneState<ID>>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps.defaultValue === this.props.defaultValue) return;
    this.setState({ value: this.props.defaultValue });
  }

  public renderClasses(): { [name: string]: boolean } {
    const classes = super.renderClasses();
    classes['mn-tabbed-pane'] = true;
    classes[`mn-layout-horizontal-stack`] = this.props.tabPosition === 'left' || this.props.tabPosition === 'right';
    classes[`mn-layout-vertical-stack`] = this.props.tabPosition === 'top' || this.props.tabPosition === 'bottom';
    return classes;
  }

  private get filteredPanes() {
    return this.props.panes.filter((pane) => !!pane?.content && !!pane.props && !pane.props.hidden);
  }

  public render() {
    const panesToShow = this.filteredPanes.filter((pane, i) => {
      pane.props.bg = this.props.bg;
      pane.props.isFirst = i === 0;
      pane.props.tabPosition = this.props.tabPosition;
      pane.props.isLast = i === this.props.panes.length - 1;
      return pane.props.tabId === this.state.value;
    });

    return (
      <Container
        {...(this.renderAttributes() as IContainableProps)}
        nodeId={this.props.nodeId}
        name={this.props.name}
        disabled={this.props.disabled}
        fill={this.props.fill}
        scroll={this.props.scroll && (this.props.tabPosition === 'right' || this.props.tabPosition === 'left')}
        scrollX={this.props.scrollX && (this.props.tabPosition === 'top' || this.props.tabPosition === 'bottom')}
        className={classNames(this.renderClasses())}
      >
        {(this.props.tabPosition === 'top' || this.props.tabPosition === 'left') && this.renderTabSet()}

        <Container className='mn-tab-panes' fill bg='1'>
          {panesToShow.map((pane, i) => (
            <TabPane key={i} {...pane.props}>
              {pane.content}
            </TabPane>
          ))}
        </Container>

        {(this.props.tabPosition === 'bottom' || this.props.tabPosition === 'right') && this.renderTabSet()}
      </Container>
    );
  }

  private renderTabSet() {
    return (
      <TabSet<ID>
        noSpacer={this.props.noSpacer}
        maxWidth={this.props.tabSetMaxWidth}
        legend={this.props.legend}
        defaultValue={this.state.value}
        tabPosition={this.props.tabPosition}
        disabled={this.props.disabled}
        onClose={(id) => this.onClose(id)}
        addButton={this.props.addButton}
        onAdd={() => this.onAdd()}
        onChange={(value) => this.onChange(value)}
        items={this.filteredPanes.map((pane) => {
          return {
            tabId: pane.props.tabId,
            label: pane.props.label,
            icon: pane.props.icon,
            iconColor: pane.props.iconColor,
            stateIcon: pane.props.stateIcon,
            stateIconColor: pane.props.stateIconColor,
            onTap: pane.props.onTap,
            selected: pane.props.selected,
            disabled: pane.props.disabled,
            closable: pane.props.closable,
            selectedBg: this.props.bg,
          };
        })}
      />
    );
  }

  private async onAdd() {
    if (!this.props.onAdd) return;
    await this.props.onAdd();
  }

  private async onClose(id: ID) {
    if (!this.props.onClose) return;
    await this.props.onClose(id);
  }

  public async onChange(value: ID) {
    if (this.state.value === value) return;
    await this.setStateAsync({ value });
    if (!this.props.onChange) return;
    await this.props.onChange(this.state.value);
  }
}
