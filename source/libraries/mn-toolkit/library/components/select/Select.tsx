import { Containable, IContainableProps, IContainableState } from '../containable';
import { Icon } from '../icon';
import { IActionsPopoverAction } from '../popover';

export function DefaultSelectLabelDecorator<ID = number>(selectItem: ISelectItem<ID>) {
  if (!selectItem?.label) return null;
  return (
    <span className='default-select-label-decorator'>
      {!!selectItem.icon?.icon && (
        <Icon
          key='icon'
          icon={selectItem.icon.icon}
          name={selectItem.icon.name}
          hint={selectItem.icon.hint}
          color={selectItem.icon.color}
        />
      )}
      {!!selectItem.label && <span key='label'>{selectItem.label}</span>}
    </span>
  );
}

export interface ISelectItem<ID = number> extends IActionsPopoverAction<ID> {
  id: ID;
  label: string;
}

export interface ISelectProps<ID = number> extends IContainableProps {
  items: ISelectItem<ID>[];
  maxVisibleItems?: number;
  width?: number;
  minWidth?: number;
  noTopContainer?: boolean;
  fill?: boolean;
  undefinedLabel?: string;
  sort?: boolean;
  value: ID;
  onChange: (value: ID) => void | Promise<void>;
  labelDecorator: (selectItem: ISelectItem<ID>) => React.ReactNode;
}

interface ISelectState extends IContainableState {}

export class Select<ID = number> extends Containable<ISelectProps<ID>, ISelectState> {
  private listPopoverId?: string;

  public static override get defaultProps(): Omit<
    ISelectProps<number>,
    'width' | 'minWidth' | 'items' | 'value' | 'onChange'
  > {
    return {
      ...super.defaultProps,
      name: '',
      disabled: false,
      undefinedLabel: '',
      labelDecorator: DefaultSelectLabelDecorator,
      noTopContainer: false,
    };
  }

  private generatePopOverActions() {
    const result: ISelectItem<ID>[] = [];
    if (!this.props.items?.length) return result;

    let items = [...this.props.items];
    if (this.props.sort) items.sort((a, b) => a.label.icompare(b.label));

    for (const item of items) {
      const listItem: ISelectItem<ID> = {
        ...item,
        selected: this.props.value === item.id,
      };

      listItem.onTap = ((x) => () => {
        app.$errorManager.handlePromise(this.selectItem(x));
      })(listItem);

      result.push(listItem);
    }
    return result;
  }

  private async selectItem(item: ISelectItem<ID>) {
    await this.hideList();
    await this.props.onChange(item.id);
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

    this.base.current.value = this.props.value?.toString() || '';
    this.base.current.focus();
  }

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    attributes.onClick = (e) => {
      this.showListItems(e);
      if (this.props.onTap) app.$errorManager.handlePromise(this.props.onTap(e));
    };
    return attributes;
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-select'] = true;
    classes['has-click'] = true;
    return classes;
  }

  public override get children() {
    const selectedItem = this.generatePopOverActions().find((action) => action.selected);
    return [
      <div key='label' className='label'>
        {this.props.labelDecorator(
          selectedItem?.label ? selectedItem : { id: undefined!, label: this.props.undefinedLabel || '' }
        )}
      </div>,

      <span key='drop-icon' className='drop-icon'>
        <Icon icon='toolkit-angle-down' name='Voir les items' />
      </span>,
    ];
  }
}
