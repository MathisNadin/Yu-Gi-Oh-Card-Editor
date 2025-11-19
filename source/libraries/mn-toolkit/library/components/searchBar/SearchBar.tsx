import { createRef } from 'react';
import { Container, IContainerProps, IContainerState } from '../container';
import { Icon } from '../icon';
import { TextInput } from '../textInput';

interface ISearchBarProps extends IContainerProps {
  /** In milliseconds, assign null to deactivate the auto-search debounce and only search on press Enter or tap the search icon */
  searchDebounce?: number | null;
  placeholder?: string;
  autofocus?: boolean;
  value: string;
  onChange: (value: string) => void | Promise<void>;
  onSearch?: (value: string) => void | Promise<void>;
}

interface ISearchBarState extends IContainerState {
  focus: boolean;
}

export class SearchBar extends Container<ISearchBarProps, ISearchBarState> {
  protected inputElement = createRef<TextInput>();
  private timer?: NodeJS.Timeout;

  public static get defaultProps(): Omit<ISearchBarProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      verticalItemAlignment: 'middle',
      bg: '1',
      searchDebounce: 200,
      placeholder: 'rechercher...',
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    if (!this.props.autofocus || app.$device.isNative) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (this.inputElement.current) this.inputElement.current.doFocus();
        })
      )
    );
  }

  private async doSearch() {
    if (this.props.onSearch) await this.props.onSearch(this.props.value);
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
        value={this.props.value}
        onChange={(value) => this.props.onChange(value)}
        onKeyUp={(e) => this.onKeyUp(e)}
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
