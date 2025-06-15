import { createRef } from 'react';
import { TDidUpdateSnapshot } from '../containable';
import { Container, IContainerProps, IContainerState } from '../container';
import { Icon } from '../icon';
import { TextInput } from '../textInput';

interface ISearchBarProps extends IContainerProps {
  /** In milliseconds, assign null to deactivate the auto-search debounce and only search on press Enter or tap the search icon */
  searchDebounce?: number | null;
  defaultValue: string;
  placeholder?: string;
  autofocus?: boolean;
  onChange?: (value: string) => void | Promise<void>;
  onSearch?: (value: string) => void | Promise<void>;
}

interface ISearchBarState extends IContainerState {
  value: string;
  focus: boolean;
}

export class SearchBar extends Container<ISearchBarProps, ISearchBarState> {
  protected inputElement = createRef<TextInput>();
  private timer?: NodeJS.Timeout;

  public static get defaultProps(): ISearchBarProps {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      verticalItemAlignment: 'middle',
      bg: '1',
      defaultValue: '',
      searchDebounce: 200,
      placeholder: 'rechercher...',
    };
  }

  public constructor(props: ISearchBarProps) {
    super(props);
    this.state = {
      ...this.state,
      value: props.defaultValue,
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    if (!this.props.autofocus || app.$device.isNative) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (this.inputElement.current) this.inputElement.current.doFocus();
      })
    );
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

  private async doSearch() {
    if (this.props.onSearch) await this.props.onSearch(this.state.value);
  }

  private async onInput(value: string) {
    await this.setStateAsync({ value });
    if (this.props.onChange) await this.props.onChange(this.state.value);
  }

  public onKeyUp(e: React.KeyboardEvent) {
    clearTimeout(this.timer);
    if (e.key === 'Enter') {
      app.$errorManager.handlePromise(this.doSearch());
    } else if (this.props.searchDebounce !== null) {
      this.timer = setTimeout(() => app.$errorManager.handlePromise(this.doSearch()), this.props.searchDebounce);
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
      <Icon
        key='search-icon'
        className='search-icon'
        icon='toolkit-search'
        name='Lancer la recherche'
        onTap={() => this.doSearch()}
      />,
      <TextInput
        key='input'
        ref={this.inputElement}
        placeholder={this.props.placeholder}
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
