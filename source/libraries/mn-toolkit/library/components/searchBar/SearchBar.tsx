import { TDidUpdateSnapshot } from '../containable';
import { Container, IContainerProps, IContainerState } from '../container';
import { Icon } from '../icon';
import { TextInput } from '../textInput';

interface ISearchBarProps extends IContainerProps {
  defaultValue: string;
  onSearch?: (value: string) => void | Promise<void>;
}

interface ISearchBarState extends IContainerState {
  value: string;
  focus: boolean;
}

export class SearchBar extends Container<ISearchBarProps, ISearchBarState> {
  private timer?: NodeJS.Timeout;

  public static get defaultProps(): ISearchBarProps {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      bg: '1',
      defaultValue: '',
    };
  }

  public constructor(props: ISearchBarProps) {
    super(props);
    this.state = {
      ...this.state,
      value: props.defaultValue,
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<ISearchBarProps>,
    prevState: Readonly<ISearchBarState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    if (this.props.defaultValue === this.state.value) return;
    this.setState({ value: this.props.defaultValue });
  }

  private doSearch() {
    if (this.props.onSearch) {
      app.$errorManager.handlePromise(this.props.onSearch(this.state.value));
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

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-search-bar'] = true;
    if (this.state.focus) classes['mn-focus'] = true;
    return classes;
  }

  public override get children() {
    return [
      <Icon key='search-icon' className='search-icon' icon='toolkit-search' onTap={() => this.doSearch()} />,
      <TextInput
        key='input'
        placeholder='rechercher...'
        defaultValue={this.state.value}
        onKeyUp={(e) => this.onKeyUp(e)}
        onChange={(value) => this.onInput(value)}
        onFocus={(e) => this.onFocus(e)}
        onBlur={(e) => this.onBlur(e)}
      />,
    ];
  }

  private async onBlur(e: React.FocusEvent<HTMLInputElement>) {
    await this.setStateAsync({ focus: false });
    if (this.props.onBlur) await this.props.onBlur(e);
  }

  private async onFocus(e: React.FocusEvent<HTMLInputElement>) {
    await this.setStateAsync({ focus: true });
    if (this.props.onFocus) await this.props.onFocus(e);
  }
}
