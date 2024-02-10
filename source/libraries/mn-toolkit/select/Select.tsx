import { classNames } from 'libraries/mn-tools';
import { TIconId, Icon } from '../icon';
import { IPopoverAction, IPopoverOptions } from '../popover';
import { TForegroundColor } from '../themeSettings';
import { Container, IContainerProps, IContainerState } from '../container';

export function DefaultSelectLabelDecorator(label: string) {
  return <span>{label}</span>;
}

export interface ISelectItem<ID = number> {
  id: ID;
  label: string;
  icon?: TIconId;
  iconColor?: TForegroundColor;
  badge?: string | number;
  selected?: boolean;
  onTap?: (event?: Event) => void;
  disabled?: boolean;
  isTitle?: boolean;
  isSubTitle?: boolean;
  separator?: boolean;
  action?: {
    icon: TIconId;
    onTap: () => void;
  };
}

interface ISelectProps<ID> extends IContainerProps {
  items: ISelectItem<ID>[];
  defaultValue?: ID;
  disabled?: boolean;
  labelDecorator?: (item: string) => React.ReactNode;
  onChange?: (value: ID) => void;
  width?: number;
  minWidth?: number;
  noTopContainer?: boolean;
  label?: string;
  fill?: boolean;
  undefinedLabel?: string;
  sort?: boolean;
  popoverMinWidth?: number;
  popoverMinHeight?: number;
}

interface ISelectState<ID> extends IContainerState {
  items: ISelectItem<ID>[];
  value: ID;
}

export class Select<ID = number> extends Container<ISelectProps<ID>, ISelectState<ID>> {
  private container!: HTMLElement;

  public static get defaultProps() {
    return {
      name: '',
      className: '',
      disabled: false,
      undefinedLabel: '',
      labelDecorator: DefaultSelectLabelDecorator,
      noTopContainer: false,
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
    let result: IPopoverAction<ID>[] = [];
    let listItem: IPopoverAction<ID>;
    let first: IPopoverAction;
    if (!this.state.items) return result;
    this.state.items.forEach((item) => {
      listItem = {
        id: item.id,
        label: item.label,
        selected: this.state.value === item.id,
        icon: item.icon,
        badge: item.badge,
        button: item.action,
        separator: item.separator,
        disabled: item.disabled,
        isTitle: item.isTitle,
        isSubTitle: item.isSubTitle,
        onTap: undefined,
      };
      listItem.onTap = (
        (x) => () =>
          app.$errorManager.handlePromise(this.selectItem(x))
      )(listItem);
      if (!first) first = listItem as unknown as IPopoverAction;
      result.push(listItem);
    });
    return result;
  }

  private async selectItem(item: IPopoverAction<ID>) {
    await this.hideList();
    const value = item.id as ID;
    this.setState({ value }, () => !!this.props.onChange && this.props.onChange(this.state.value));
  }

  private async hideList() {
    await app.$popover.close();
    this.container.blur();
  }

  public showListItems() {
    if (this.props.disabled) return;
    let actions = this.generatePopOverActions();
    if (actions.length === 0) return;
    app.$popover.show({
      targetElement: this.container,
      targetEnlarge: 0,
      syncWidth: true,
      actions,
      cssClass: 'mn-select-popover',
      maxVisibleItems: 5,
      scrollToItem: this.getSelectedListItem(actions),
      minWidth: this.props.popoverMinWidth,
      minHeight: this.props.popoverMinHeight,
    } as IPopoverOptions);

    this.container.value = this.state.value ? this.state.value.toString() : '';
    // fireEvent(this.container, 'input');
    // const value = this.state.value ? this.state.value.toString() : '';
    // fireEvent.change(this.container, { target: { value } });
    this.container.focus();
  }

  private onContainerRef(ref: HTMLElement | null) {
    if (!ref) return;
    this.container = ref;
  }

  private getSelectedListItem(actions: IPopoverAction<ID>[]) {
    return actions.find((action) => action.selected);
  }

  public render() {
    const selectedItem = this.getSelectedListItem(this.generatePopOverActions()) as IPopoverAction<ID>;
    return (
      <div
        className={classNames(this.renderClasses('mn-select'), {
          'mn-containable-item-fill': this.props.fill,
          disabled: this.props.disabled,
        })}
        ref={(ref) => this.onContainerRef(ref)}
        style={{ minWidth: this.props.width || this.props.minWidth }}
      >
        <div className='label' onClick={() => this.showListItems()}>
          {!!this.props.labelDecorator &&
            this.props.labelDecorator(
              selectedItem ? (selectedItem.label as string) : (this.props.undefinedLabel as string)
            )}
        </div>

        <span className='drop-icon' onClick={() => this.showListItems()}>
          <Icon iconId='toolkit-angle-down' />
        </span>
      </div>
    );
  }
}
