import './styles.css';
import { Containable, IContainableProps } from "mn-toolkit/containable/Containable";
import { classNames } from "mn-toolkit/tools";
import { ReactNode } from "react";

export type TabPosition = 'top' | 'bottom' | 'left' | 'right';

export interface ITabItem {
  id?: string;
  label: string | ReactNode;
  // icon?: IconId;
  // iconColor?: ForegroundColor;
  stateIcon?: string;
  stateIconColor?: string;
  badge?: string | number;
  onTap?: IContainableProps['onTap'];
  selected?: boolean;
  disabled?: boolean;
  closable?: boolean;
  // selectedBg?: BackgroundColor;
}

export interface ITabSetProps extends IContainableProps {
  items: ITabItem[];
  tabPosition?: TabPosition;
  defaultValue: string;
  onChange?: (value: string) => Promise<void> | void;
  onClose?: (id: string) => Promise<void> | void;
  // addButton?: boolean;
  // onAdd?: () => Promise<void> | void;
  // legend?: string;
}

interface ITabSetState {
  value: string;
  items: ITabItem[];
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
export class TabSet extends Containable<ITabSetProps, ITabSetState> {

  public constructor(props: ITabSetProps) {
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

  public get tabIndex() {
    return this.state.value;
  }

  public set tabIndex(value: string) {
    this.setState({ value });
    if (this.props.onChange) app.$errorManager.handlePromise(this.props.onChange(value));
  }

/*   public componentWillUpdate(props: ITabSetProps) {
    // eslint-disable-next-line react/no-will-update-set-state
    this.setState({ value: props.defaultValue, items: props.items });
  } */

  public componentWillReceiveProps(props: ITabSetProps) {
    this.setState({ value: props.defaultValue, items: props.items });
  }

  private getListItems() {
    let result: ITabItem[] = [];
    let first: ITabItem;
    this.state.items.forEach((item) => {
      let listItem : ITabItem = {
        id: item.id,
        label: item.label,
        selected: this.state.value === item.id,
        // icon: item.icon,
        // iconColor: item.iconColor,
        badge: item.badge,
        disabled: item.disabled,
        closable: item.closable,
        // selectedBg: item.selectedBg
      } as ITabItem;
      listItem.onTap = ((x) => () => this.selectItem(x))(listItem);
      if (!first) first = listItem;
      result.push(listItem);
    });
    return result;
  }

  public selectItem(item: ITabItem) {
    this.tabIndex = item.id as string;
  }

  public renderClasses(name?: string): { [name: string]: boolean; } {
    let classes = super.renderClasses(name);
    classes[`mn-tabbed-pane-tab-position-${this.props.tabPosition}`] = true;
    return classes;
  }

  public render() {
    let items = this.getListItems();
    return this.renderAttributes(<div>
{/*       {!!this.props.legend && <Typography variant="h5" content={this.props.legend}/>} */}
{/*       {this.props.tabPosition==='bottom' && <Spacer />} */}
      {items.map((item) => (
        <span
          className={classNames({ selected: item.selected, disabled: item.disabled }, /* `mn-bg-${item.selectedBg}`, */ "item")}
          id={`mn-tab-button-${item.id}`}
          onClick={() => this.selectItem(item)}
        >
{/*           {!!item.icon && <Icon className='icon' iconId={item.icon} color={item.iconColor} />} */}
          <span className="label">{item.label}</span>
          {item.badge || item.closable || item.stateIcon ? <span className="mn-indicators">
            {item.badge ? <span className="mn-badge">{item.badge}</span> : null}
            {!item.stateIcon ? "" : <span className={`icon ${item.stateIcon} mn-color-${item.stateIconColor}`} />}
            {item.closable ? <span className="mn-close" onClick={() => this.onClose(item.id as string)} /> : null}
          </span> : null}
        </span>
      ))}
{/*       {this.props.tabPosition==='top' && <Spacer />}
      {this.props.addButton ? <span className="mn-tabset-add-button-holder">
        <ButtonIcon icon="toolkit-plus" onTap={() => this.onAddButton()} />
      </span> : null} */}
    </div>, 'mn-tabset');
  }

/*   public onAddButton() {
    if (this.props.onAdd) app.$errorManager.handlePromise(this.props.onAdd());
  } */

  private onClose(id: string) {
    if (this.props.onClose) app.$errorManager.handlePromise(this.props.onClose(id));
  }
}
