import { Containable, IContainableProps, IContainableState, TDidUpdateSnapshot } from '../containable';
import { Icon } from '../icon';
import { IActionsPopoverAction } from '../popover';

export function DefaultSelectLabelDecorator(label: string | undefined) {
  if (!label) return null;
  return <span>{label}</span>;
}

export interface ISelectItem<ID = number> extends IActionsPopoverAction<ID> {
  id: ID;
  label: string;
}

export interface ISelectProps<ID = number> extends IContainableProps {
  items: ISelectItem<ID>[];
  maxVisibleItems?: number;
  defaultValue?: ID;
  disabled?: boolean;
  labelDecorator?: (label: string | undefined) => React.ReactNode;
  onChange?: (value: ID) => void | Promise<void>;
  width?: number;
  minWidth?: number;
  noTopContainer?: boolean;
  fill?: boolean;
  undefinedLabel?: string;
  sort?: boolean;
}

interface ISelectState<ID> extends IContainableState {
  items: ISelectItem<ID>[];
  value: ID;
}

export class Select<ID = number> extends Containable<ISelectProps<ID>, ISelectState<ID>> {
  private listPopoverId?: string;

  public static override get defaultProps(): ISelectProps<number> {
    return {
      ...super.defaultProps,
      name: '',
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

  public override componentDidUpdate(
    prevProps: Readonly<ISelectProps<ID>>,
    prevState: Readonly<ISelectState<ID>>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    if (this.props.defaultValue !== this.state.value || this.props.items !== this.state.items) {
      this.setState({ value: this.props.defaultValue!, items: this.props.items });
    }
  }

  private generatePopOverActions() {
    const result: IActionsPopoverAction<ID>[] = [];
    if (!this.state.items?.length) return result;

    for (const item of this.state.items) {
      const listItem: IActionsPopoverAction<ID> = {
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

      result.push(listItem);
    }
    return result;
  }

  private async selectItem(item: IActionsPopoverAction<ID>) {
    this.hideList();
    await this.setStateAsync({ value: item.id as ID });
    if (!this.props.onChange) return;
    await this.props.onChange(this.state.value);
  }

  private async hideList() {
    if (this.listPopoverId) app.$popover.remove(this.listPopoverId);
    if (this.base.current) this.base.current.blur();
  }

  public showListItems(_event: React.MouseEvent<HTMLDivElement | HTMLSpanElement>) {
    if (this.props.disabled || !this.base.current) return;

    const actions = this.generatePopOverActions();
    if (!actions.length) return;

    this.listPopoverId = app.$popover.actions(this.base.current.getBoundingClientRect(), {
      syncWidth: true,
      actions,
      className: 'mn-select-popover',
      maxVisibleActions: this.props.maxVisibleItems,
    });

    this.base.current.value = this.state.value?.toString() || '';
    this.base.current.focus();
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-select'] = true;
    return classes;
  }

  public override get children() {
    const selectedItem = this.generatePopOverActions().find((action) => action.selected);
    return [
      <div key='label' className='label' onClick={(e) => this.showListItems(e)}>
        {this.props.labelDecorator!(selectedItem?.label ?? this.props.undefinedLabel)}
      </div>,

      <span key='drop-icon' className='drop-icon' onClick={(e) => this.showListItems(e)}>
        <Icon icon='toolkit-angle-down' name='Voir les items' />
      </span>,
    ];
  }
}
