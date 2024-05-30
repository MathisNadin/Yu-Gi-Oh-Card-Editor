import { classNames } from 'mn-tools';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { Icon } from '../icon';
import { ISelectItem, Select } from '../select';
import { TextInput } from '../textInput';

interface ISearchBarProps extends IContainableProps {
  defaultValue: string;
  dropdownOptions?: ISelectItem[];
  onSearch: (value: string) => void | Promise<void>;
  onFocus?: (e: React.FocusEvent) => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
}

interface ISearchBarState extends IContainableState {
  value: string;
  focus: boolean;
}

export class SearchBar extends Containable<ISearchBarProps, ISearchBarState> {
  private timer!: NodeJS.Timeout;

  public static get defaultProps() {
    return { ...super.defaultProps };
  }

  public constructor(props: ISearchBarProps) {
    super(props);
    this.state = {
      ...this.state,
      value: props.defaultValue || '',
    };
  }

  public componentDidUpdate(prevProps: ISearchBarProps) {
    if (prevProps === this.props) return;
    if (this.props.defaultValue === this.state.value) return;
    this.setState({ value: this.props.defaultValue });
  }

  private doSearch() {
    const value = this.state.value.trim();
    if (this.props.onSearch) {
      app.$errorManager.handlePromise(this.props.onSearch(value));
    }
  }

  private async onInput(value: string) {
    await this.setStateAsync({ value });
  }

  public onKeyUp(e: React.KeyboardEvent) {
    clearTimeout(this.timer);
    if (e.key === 'Enter') {
      this.doSearch();
    } else {
      this.timer = setTimeout(() => this.doSearch(), 200);
    }
  }

  public render() {
    if (this.props.dropdownOptions) {
      return this.renderBarWithDropdown();
    } else {
      return this.renderNormalBar();
    }
  }

  private renderBarWithDropdown() {
    return (
      <div
        className={classNames('mn-search-bar-dropdown', this.renderClasses(), {
          'mn-focus': this.state.focus,
        })}
      >
        <Select fill className='mn-search-bar-select' items={this.props.dropdownOptions || []} defaultValue={1} />
        <Icon className='search-icon' iconId='toolkit-search' onTap={() => this.doSearch()} />
        <TextInput
          placeholder='rechercher...'
          defaultValue={this.state.value}
          onKeyUp={(e) => this.onKeyUp(e)}
          onChange={(value) => this.onInput(value)}
          onFocus={(e) => this.onFocus(e)}
          onBlur={() => this.onBlur()}
        />
      </div>
    );
  }

  private renderNormalBar() {
    return (
      <div className={classNames('mn-search-bar', this.renderClasses(), { 'mn-focus': this.state.focus })}>
        <Icon className='search-icon' iconId='toolkit-search' onTap={() => this.doSearch()} />
        <TextInput
          placeholder='rechercher...'
          defaultValue={this.state.value}
          onKeyUp={(e) => this.onKeyUp(e)}
          onChange={(value) => this.onInput(value)}
          onFocus={(e) => this.onFocus(e)}
          onBlur={() => this.onBlur()}
        />
      </div>
    );
  }

  private async onBlur() {
    await this.setStateAsync({ focus: false });
    if (this.props.onBlur) app.$errorManager.handlePromise(this.props.onBlur());
  }

  private async onFocus(e: React.FocusEvent) {
    await this.setStateAsync({ focus: true });
    if (this.props.onFocus) app.$errorManager.handlePromise(this.props.onFocus(e));
  }
}
