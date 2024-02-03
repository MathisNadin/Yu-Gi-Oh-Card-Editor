import { Containable, IContainableProps } from "libraries/mn-toolkit/containable";
import { classNames } from "libraries/mn-tools";
import { ReactNode } from "react";
import { Typography } from '../typography';
import { Spacer } from '../spacer';
import { Icon, TIconId } from '../icon';
import { ButtonIcon } from '../button';
import { TForegroundColor, TBackgroundColor } from '../themeSettings';

export type TAbstractTabIndex = string | undefined;

export type TabPosition = 'top' | 'bottom' | 'left' | 'right';

export interface ITabItem<TAbstractTabIndex> {
  id?: TAbstractTabIndex;
  label: string | ReactNode;
  icon?: TIconId;
  iconColor?: TForegroundColor;
  stateIcon?: string;
  stateIconColor?: string;
  badge?: string | number;
  onTap?: IContainableProps['onTap'];
  selected?: boolean;
  disabled?: boolean;
  closable?: boolean;
  selectedBg?: TBackgroundColor;
}

export interface ITabSetProps<TAbstractTabIndex> extends IContainableProps {
  items: ITabItem<TAbstractTabIndex>[];
  tabPosition?: TabPosition;
  defaultValue: TAbstractTabIndex;
  onChange?: (value: TAbstractTabIndex) => Promise<void> | void;
  onClose?: (id: string) => Promise<void> | void;
  addButton?: boolean;
  onAdd?: () => Promise<void> | void;
  legend?: string;
}

interface ITabSetState<TAbstractTabIndex> {
  value: TAbstractTabIndex;
  items: ITabItem<TAbstractTabIndex>[];
  loaded: boolean;
}

/** Create a TabSet.
 *
 * Constructor need a ITabSetProps.
 * - items
 * - defaultValue
 * - ?name
 * - ?classname
 * - ?disabled
 * - ?onChange
 */
export class TabSet<TAbstractTabIndex> extends Containable<ITabSetProps<TAbstractTabIndex>, ITabSetState<TAbstractTabIndex>> {

  public constructor(props: ITabSetProps<TAbstractTabIndex>) {
    super(props);
    this.state = {
      loaded: true,
      value: props.defaultValue,
      items: props.items
    };
  }

  public static get defaultProps() {
    return {
      name: '',
      className: '',
      idKey: 'id',
      labelKey: 'label',
      disabled: false,
      positon: 'top',
    };
  }

  public get tabIndex(): TAbstractTabIndex {
    return this.state.value;
  }

  public set tabIndex(value: TAbstractTabIndex) {
    this.setState({ value }, () => this.props.onChange && app.$errorManager.handlePromise(this.props.onChange(this.state.value)));
  }

/*   public componentWillUpdate(props: ITabSetProps) {
    // eslint-disable-next-line react/no-will-update-set-state
    this.setState({ value: props.defaultValue, items: props.items });
  } */

  public componentWillReceiveProps(props: ITabSetProps<TAbstractTabIndex>) {
    this.setState({ value: props.defaultValue, items: props.items });
  }

  private getListItems() {
    let result: ITabItem<TAbstractTabIndex>[] = [];
    let first: ITabItem<TAbstractTabIndex>;
    this.state.items.forEach((item) => {
      let listItem : ITabItem<TAbstractTabIndex> = {
        id: item.id,
        label: item.label,
        selected: this.state.value === item.id,
        icon: item.icon,
        iconColor: item.iconColor,
        badge: item.badge,
        disabled: item.disabled,
        closable: item.closable,
        selectedBg: item.selectedBg
      } as ITabItem<TAbstractTabIndex>;
      listItem.onTap = ((x) => () => this.selectItem(x))(listItem);
      if (!first) first = listItem;
      result.push(listItem);
    });
    return result;
  }

  public selectItem(item: ITabItem<TAbstractTabIndex>) {
    this.tabIndex = item.id as TAbstractTabIndex;
  }

  public renderClasses(name?: string): { [name: string]: boolean; } {
    let classes = super.renderClasses(name);
    classes[`mn-tabbed-pane-tab-position-${this.props.tabPosition}`] = true;
    return classes;
  }

  public render() {
    let items = this.getListItems();
    return this.renderAttributes(<div>
      {!!this.props.legend && <Typography variant="h5" content={this.props.legend}/>}
      {this.props.tabPosition==='bottom' && <Spacer />}
      {items.map(item => (
        // eslint-disable-next-line react/jsx-key
        <span
          className={classNames({ selected: item.selected, disabled: item.disabled }, /* `mn-bg-${item.selectedBg}`, */ "item")}
          id={`mn-tab-button-${item.id}`}
          onClick={() => this.selectItem(item)}
        >
          {!!item.icon && <Icon className='icon' iconId={item.icon} color={item.iconColor} />}
          <span className="label">{item.label}</span>
          {(!!item.badge || !!item.closable || !!item.stateIcon) && <span className="mn-indicators">
            {item.badge ? <span className="mn-badge">{item.badge}</span> : null}
            {!item.stateIcon ? '' : <span className={`icon ${item.stateIcon} mn-color-${item.stateIconColor}`} />}
            {!!item.closable && <span className="mn-close" onClick={() => this.onClose(item.id as string)} />}
          </span>}
        </span>
      ))}
      {this.props.tabPosition==='top' && <Spacer />}
      {this.props.addButton ? <span className="mn-tabset-add-button-holder">
        <ButtonIcon icon="toolkit-plus" onTap={() => this.onAddButton()} />
      </span> : null}
    </div>, 'mn-tabset');
  }

  public onAddButton() {
    if (this.props.onAdd) app.$errorManager.handlePromise(this.props.onAdd());
  }

  private onClose(id: string) {
    if (this.props.onClose) app.$errorManager.handlePromise(this.props.onClose(id));
  }
}
