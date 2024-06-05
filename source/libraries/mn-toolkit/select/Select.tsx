import { classNames } from 'mn-tools';
import { Icon } from '../icon';
import { IActionsPopoverAction } from '../popover';
import { Container, IContainerProps, IContainerState } from '../container';

export function DefaultSelectLabelDecorator(label: string) {
  return <span>{label}</span>;
}

export interface ISelectItem<ID = number> extends IActionsPopoverAction<ID> {
  id: ID;
  label: string;
}

export interface ISelectProps<ID = number> extends IContainerProps {
  items: ISelectItem<ID>[];
  maxVisibleItems?: number;
  defaultValue?: ID;
  disabled?: boolean;
  labelDecorator?: (item: string) => React.ReactNode;
  onChange?: (value: ID) => void | Promise<void>;
  width?: number;
  minWidth?: number;
  noTopContainer?: boolean;
  label?: string;
  fill?: boolean;
  undefinedLabel?: string;
  sort?: boolean;
}

interface ISelectState<ID> extends IContainerState {
  items: ISelectItem<ID>[];
  value: ID;
}

export class Select<ID = number> extends Container<ISelectProps<ID>, ISelectState<ID>> {
  private container!: HTMLElement;

  public static get defaultProps(): ISelectProps<number> {
    return {
      ...super.defaultProps,
      name: '',
      className: '',
      disabled: false,
      undefinedLabel: '',
      labelDecorator: DefaultSelectLabelDecorator,
      noTopContainer: false,
      items: [],
      width: undefined,
      minWidth: undefined,
    };
  }

  public constructor(props: ISelectProps<ID>) {
    super(props);
    if (this.props.sort) props.items.sort((a, b) => a.label.icompare(b.label));
    this.state = { ...this.state, value: props.defaultValue as ID, items: props.items };
  }

  public componentDidUpdate() {
    if (this.props.defaultValue !== this.state.value || this.props.items !== this.state.items) {
      this.setState({ value: this.props.defaultValue as ID, items: this.props.items });
    }
  }

  private generatePopOverActions() {
    let result: IActionsPopoverAction<ID>[] = [];
    let listItem: IActionsPopoverAction<ID>;
    let first: IActionsPopoverAction<ID>;
    if (!this.state.items) return result;
    this.state.items.forEach((item) => {
      listItem = {
        id: item.id,
        label: item.label,
        selected: this.state.value === item.id,
        icon: item.icon,
        separator: item.separator,
        disabled: item.disabled,
      };
      listItem.onTap = ((x) => () => {
        app.$errorManager.handlePromise(this.selectItem(x));
      })(listItem);
      if (!first) first = listItem as IActionsPopoverAction<ID>;
      result.push(listItem);
    });
    return result;
  }

  private async selectItem(item: IActionsPopoverAction<ID>) {
    await this.hideList();
    const value = item.id as ID;
    this.setState(
      { value },
      () => !!this.props.onChange && app.$errorManager.handlePromise(this.props.onChange(this.state.value))
    );
  }

  private async hideList() {
    await app.$popover.removeAll();
    this.container.blur();
  }

  public showListItems(event: React.MouseEvent) {
    if (this.props.disabled) return;
    let actions = this.generatePopOverActions();
    if (actions.length === 0) return;
    const targetRectangle = this.container.getBoundingClientRect();
    app.$popover.actions(event, {
      targetRectangle,
      syncWidth: true,
      actions,
      className: 'mn-select-popover',
      maxVisibleActions: this.props.maxVisibleItems,
    });

    this.container.value = this.state.value?.toString() || '';
    this.container.focus();
  }

  private onContainerRef(ref: HTMLElement | null) {
    if (!ref) return;
    this.container = ref;
  }

  private getSelectedListItem(actions: IActionsPopoverAction<ID>[]) {
    return actions.find((action) => action.selected);
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-select'] = true;
    classes['mn-containable-item-fill'] = !!this.props.fill;
    classes['disabled'] = !!this.props.disabled;
    return classes;
  }

  public render() {
    const selectedItem = this.getSelectedListItem(this.generatePopOverActions()) as IActionsPopoverAction<ID>;
    return (
      <div
        className={classNames(this.renderClasses())}
        ref={(ref) => this.onContainerRef(ref)}
        style={{ minWidth: this.props.width || this.props.minWidth }}
      >
        <div className='label' onClick={(e) => this.showListItems(e)}>
          {!!this.props.labelDecorator &&
            this.props.labelDecorator(
              selectedItem ? (selectedItem.label as string) : (this.props.undefinedLabel as string)
            )}
        </div>

        <span className='drop-icon' onClick={(e) => this.showListItems(e)}>
          <Icon iconId='toolkit-angle-down' />
        </span>
      </div>
    );
  }
}
