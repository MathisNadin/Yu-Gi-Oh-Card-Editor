import { classNames } from 'mn-tools';
import { Containable, IContainableProps, IContainableState, TDidUpdateSnapshot } from '../containable';
import { JSXElementChild } from '../react';
import { TIconId, Icon } from '../icon';
import { Spacer } from '../spacer';
import { TForegroundColor, TBackgroundColor } from '../theme';
import { Typography } from '../typography';

export type TTabPosition = 'top' | 'bottom' | 'left' | 'right';

export interface ITabItem<ID = string> {
  tabId: ID;
  label: string | JSXElementChild;
  icon?: TIconId;
  iconColor?: TForegroundColor;
  stateIcon?: string;
  stateIconColor?: string;
  selected?: boolean;
  disabled?: boolean;
  closable?: boolean;
  selectedBg?: TBackgroundColor;
  onTap?: (event: React.MouseEvent) => void | Promise<void>;
}

export interface ITabSetProps<ID> extends IContainableProps {
  items: ITabItem<ID>[];
  tabPosition?: TTabPosition;
  defaultValue: ID;
  onChange?: (value: ID) => Promise<void> | void;
  onClose?: (tabId: ID) => Promise<void> | void;
  addButton?: boolean;
  onAdd?: () => Promise<void> | void;
  legend?: string;
  noSpacer?: boolean;
}

interface ITabSetState<ID> extends IContainableState {
  value: ID;
  items: ITabItem<ID>[];
}

export class TabSet<ID = number> extends Containable<ITabSetProps<ID>, ITabSetState<ID>> {
  public static get defaultProps(): Partial<ITabSetProps<number>> {
    return {
      ...super.defaultProps,
      name: '',
      className: '',
      disabled: false,
    };
  }

  public get tabIndex() {
    return this.state.value;
  }

  public constructor(props: ITabSetProps<ID>) {
    super(props);
    this.state = { ...this.state, value: props.defaultValue, items: props.items };
  }

  public override componentDidUpdate(
    prevProps: Readonly<ITabSetProps<ID>>,
    prevState: Readonly<ITabSetState<ID>>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps.defaultValue === this.props.defaultValue && prevProps.items === this.props.items) return;
    this.setState({ value: this.props.defaultValue, items: this.props.items });
  }

  private getListItems() {
    const result: ITabItem<ID>[] = [];
    let first!: ITabItem<ID>;

    for (const item of this.state.items) {
      const listItem: ITabItem<ID> = {
        tabId: item.tabId,
        label: item.label,
        selected: this.state.value === item.tabId,
        icon: item.icon,
        iconColor: item.iconColor,
        disabled: item.disabled,
        closable: item.closable,
        selectedBg: item.selectedBg,
      };

      listItem.onTap = (
        (x) => () =>
          this.selectItem(x)
      )(listItem);

      if (!first) {
        first = listItem;
      }

      result.push(listItem);
    }
    return result;
  }

  public async selectItem(item: ITabItem<ID>) {
    await this.setStateAsync({ value: item.tabId });
    if (!this.props.onChange) return;
    await this.props.onChange(this.state.value);
  }

  public renderClasses(): { [name: string]: boolean } {
    const classes = super.renderClasses();
    classes['mn-tabset'] = true;
    classes[`mn-tabbed-pane-tab-position-${this.props.tabPosition}`] = true;
    return classes;
  }

  public override render() {
    const items = this.getListItems();
    const selectedIndex = items.findIndex((i) => i.selected);
    return (
      <div {...this.renderAttributes()}>
        {!!this.props.legend && <Typography variant='h5' content={this.props.legend} />}

        {!this.props.noSpacer && this.props.tabPosition === 'bottom' && <Spacer />}

        {items.map((item, index) => (
          <span
            key={`${item.tabId}-${index}`}
            id={`mn-tab-button-${item.tabId}`}
            onClick={() => app.$errorManager.handlePromise(this.selectItem(item))}
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
        ))}

        {!this.props.noSpacer && this.props.tabPosition !== 'bottom' && <Spacer />}

        {this.props.addButton && (
          <span className='mn-tabset-add-button-holder'>
            <Icon icon='toolkit-plus' onTap={() => this.onAddButton()} />
          </span>
        )}
      </div>
    );
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
