import { classNames } from 'mn-tools';
import { TJSXElementChild, TForegroundColor, TBackgroundColor } from '../../system';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { TIconId, Icon } from '../icon';
import { Spacer } from '../spacer';
import { Typography } from '../typography';

export type TTabPosition = 'top' | 'bottom' | 'left' | 'right';

export interface ITabItem<ID = string> {
  tabId: ID;
  label: string | TJSXElementChild;
  icon?: TIconId;
  iconColor?: TForegroundColor;
  stateIcon?: string;
  stateIconColor?: string;
  selected?: boolean;
  disabled?: boolean;
  closable?: boolean;
  selectedBg?: TBackgroundColor;
  onTap?: (event: React.MouseEvent<HTMLDivElement>) => void | Promise<void>;
}

export interface ITabSetProps<ID> extends IContainableProps {
  tabPosition?: TTabPosition;
  items: ITabItem<ID>[];
  value: ID;
  onChange: (value: ID) => Promise<void> | void;
  onClose?: (tabId: ID) => Promise<void> | void;
  addButton?: boolean;
  onAdd?: () => Promise<void> | void;
  legend?: string;
  noSpacer?: boolean;
}

interface ITabSetState extends IContainableState {}

export class TabSet<ID = number> extends Containable<ITabSetProps<ID>, ITabSetState> {
  public static override get defaultProps(): Omit<ITabSetProps<number>, 'items' | 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
    };
  }

  private getListItems() {
    const result: ITabItem<ID>[] = [];
    let first!: ITabItem<ID>;

    for (const item of this.props.items) {
      const listItem: ITabItem<ID> = {
        tabId: item.tabId,
        label: item.label,
        selected: this.props.value === item.tabId,
        icon: item.icon,
        iconColor: item.iconColor,
        disabled: item.disabled,
        closable: item.closable,
        selectedBg: item.selectedBg,
      };

      listItem.onTap = ((x) => async () => {
        await this.props.onChange(x.tabId);
      })(listItem);

      if (!first) {
        first = listItem;
      }

      result.push(listItem);
    }
    return result;
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-tabset'] = true;
    if (this.props.tabPosition) classes[`mn-tabbed-pane-tab-position-${this.props.tabPosition}`] = true;
    return classes;
  }

  public override get children() {
    const items = this.getListItems();
    const selectedIndex = items.findIndex((i) => i.selected);
    return [
      !!this.props.legend && <Typography key='legend' variant='h5' content={this.props.legend} />,

      !this.props.noSpacer && this.props.tabPosition === 'bottom' && <Spacer key='spacer-top' />,

      items.map((item, index) => (
        <span
          key={`${String(item.tabId)}-${index}`}
          id={`mn-tab-button-${String(item.tabId)}`}
          onClick={() => app.$errorManager.handlePromise(this.props.onChange(item.tabId))}
          className={classNames(
            'item',
            {
              'before-selected': index === selectedIndex - 1,
              selected: item.selected,
              'after-selected': index === selectedIndex + 1,
              disabled: item.disabled,
            },
            `mn-bg-${item.selectedBg}`
          )}
        >
          {!!item.icon && <Icon className='icon' icon={item.icon} color={item.iconColor} />}

          <span className='label'>{item.label}</span>

          {(!!item.closable || !!item.stateIcon) && (
            <span className='mn-indicators'>
              {!!item.stateIcon && <span className={`icon ${item.stateIcon} mn-color-${item.stateIconColor}`} />}
              {item.closable && <span className='mn-close' onClick={() => this.onClose(item.tabId)} />}
            </span>
          )}
        </span>
      )),

      !this.props.noSpacer && this.props.tabPosition !== 'bottom' && <Spacer key='spacer-bottom' />,

      this.props.addButton && (
        <span key='mn-tabset-add-button-holder' className='mn-tabset-add-button-holder'>
          <Icon icon='toolkit-plus' name='Ajouter' onTap={() => this.onAddButton()} />
        </span>
      ),
    ];
  }

  public onAddButton() {
    if (!this.props.onAdd) return;
    app.$errorManager.handlePromise(this.props.onAdd());
  }

  private onClose(id: ID) {
    if (!this.props.onClose) return;
    app.$errorManager.handlePromise(this.props.onClose(id));
  }
}
