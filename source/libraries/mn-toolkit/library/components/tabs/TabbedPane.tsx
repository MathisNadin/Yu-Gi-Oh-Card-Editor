import { TJSXElementChildren } from '../../system';
import { TDidUpdateSnapshot } from '../containable';
import { Container, IContainerProps, IContainerState, VerticalStack } from '../container';
import { ITabSetProps, TabSet, TTabPosition } from './TabSet';
import { ITabPaneProps, TabPane } from './TabPane';

export interface ITabbedPanePane<ID = number> {
  props: ITabPaneProps<ID>;
  content: TJSXElementChildren;
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
  public static override get defaultProps(): ITabbedPaneProps {
    return {
      ...super.defaultProps,
      panes: [],
      name: '',
      disabled: false,
      layout: 'vertical',
      tabPosition: 'top',
      fill: true,
      defaultValue: undefined!,
      items: [],
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

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-tabbed-pane'] = true;
    classes['mn-layout-horizontal-stack'] = this.props.tabPosition === 'left' || this.props.tabPosition === 'right';
    classes['mn-layout-vertical-stack'] = this.props.tabPosition === 'top' || this.props.tabPosition === 'bottom';
    classes['mn-scroll'] =
      !!this.props.scroll && (this.props.tabPosition === 'right' || this.props.tabPosition === 'left');
    classes['mn-scroll-x'] =
      !!this.props.scrollX && (this.props.tabPosition === 'top' || this.props.tabPosition === 'bottom');
    return classes;
  }

  public override get children() {
    const filteredPanes: ITabbedPanePane<ID>[] = [];

    let i = 0;
    for (const pane of this.props.panes) {
      if (!pane?.content || !pane.props) continue;

      pane.props.bg = this.props.bg;
      pane.props.isFirst = i === 0;
      pane.props.tabPosition = this.props.tabPosition;
      pane.props.isLast = i === this.props.panes.length - 1;

      filteredPanes.push(pane);
      i++;
    }

    return [
      (this.props.tabPosition === 'top' || this.props.tabPosition === 'left') && this.renderTabSet(filteredPanes),

      <VerticalStack key='tab-panes' className='mn-tab-panes' fill bg='1'>
        {filteredPanes.map((pane, i) => (
          <TabPane key={i} {...pane.props} hidden={pane.props.hidden || pane.props.tabId !== this.state.value}>
            {pane.content}
          </TabPane>
        ))}
      </VerticalStack>,

      (this.props.tabPosition === 'bottom' || this.props.tabPosition === 'right') && this.renderTabSet(filteredPanes),
    ];
  }

  private renderTabSet(filteredPanes: ITabbedPanePane<ID>[]) {
    return (
      <TabSet<ID>
        key='tab-set'
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
        items={filteredPanes.map((pane) => {
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
    if (this.props.onAdd) await this.props.onAdd();
  }

  private async onClose(id: ID) {
    if (this.props.onClose) await this.props.onClose(id);
  }

  public async onChange(value: ID) {
    if (this.state.value === value) return;
    await this.setStateAsync({ value });
    if (this.props.onChange) await this.props.onChange(this.state.value);
  }
}
