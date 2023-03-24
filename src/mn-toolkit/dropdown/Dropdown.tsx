/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */
import { IContainableProps, IContainableState, Containable } from 'mn-toolkit/containable/Containable';
import { createRef } from 'react';

interface DropdownProps extends IContainableProps {
  options: string[];
  defaultOption?: string;
}

interface DropdownState extends IContainableState {
  isOpen: boolean;
  selectedOption: string;
}

export class Dropdown extends Containable<DropdownProps, DropdownState> {
  popoverRef = createRef<HTMLDivElement>();

  public constructor(props: DropdownProps) {
    super(props);

    this.state = {
      loaded: true,
      isOpen: false,
      selectedOption: props.options[0],
    };
  }

  private toggleDropdown = () => {
    this.setState({ isOpen: !this.state.isOpen });
  }

  private handleOptionSelect = (option: string) => {
    this.setState({ selectedOption: option, isOpen: false });
  }

  private handleOutsideClick = (event: MouseEvent) => {
    if (this.popoverRef.current && !this.popoverRef.current.contains(event.target as Node)) {
      this.setState({ isOpen: false });
    }
  }

  public componentDidMount() {
    document.addEventListener('mousedown', this.handleOutsideClick);
  }

  public componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleOutsideClick);
  }

  public render() {
    const { options } = this.props;
    const { isOpen, selectedOption } = this.state;

    return (
      <div className="dropdown" ref={this.popoverRef}>
        <div className="dropdown-toggle" onClick={this.toggleDropdown}>
          {selectedOption}
        </div>
        {isOpen && (
          <div className="popover">
            <ul className="dropdown-menu">
              {options.map((option) => (
                <li key={option} onClick={() => this.handleOptionSelect(option)}>
                  {option}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}
