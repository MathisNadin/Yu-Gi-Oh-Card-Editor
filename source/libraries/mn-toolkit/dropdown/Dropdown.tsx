import { IContainableProps, IContainableState, Containable } from 'libraries/mn-toolkit/containable';
import { VerticalStack } from 'libraries/mn-toolkit/container';

interface DropdownProps<T extends string> extends IContainableProps {
  options: T[];
  optionsLabel?: string[];
  defaultOption?: T;
  onSelect: (value: T) => void;
}

interface DropdownState<T extends string> extends IContainableState {
  isOpen: boolean;
  selectedOption: T;
}

export class Dropdown<T extends string> extends Containable<DropdownProps<T>, DropdownState<T>> {
  public constructor(props: DropdownProps<T>) {
    super(props);

    this.state = {
      loaded: true,
      isOpen: false,
      selectedOption: props.defaultOption as T,
    };
  }

  public componentDidUpdate() {
    if (this.props.defaultOption !== this.state.selectedOption) {
      this.setState({ selectedOption: this.props.defaultOption as T });
    }
  }

  private onChange(value: T) {
    this.setState(
      { selectedOption: value },
      () => !!this.props.onSelect && this.props.onSelect(this.state.selectedOption)
    );
  }

  public renderClasses(name?: string) {
    return super.renderClasses(name);
  }

  public render() {
    return this.renderAttributes(
      <VerticalStack>
        <select value={this.state.selectedOption} onChange={(e) => this.onChange(e.target.value as T)}>
          {this.props.options.map((option, iOption) => {
            return (
              <option key={`iOption-${iOption}`} defaultValue={option} value={option}>
                {this.props.optionsLabel ? this.props.optionsLabel[iOption] : option}
              </option>
            );
          })}
        </select>
      </VerticalStack>,
      'mn-dropdown'
    );
  }
}
