/* eslint-disable no-unused-vars */
/* eslint-disable no-return-assign */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */
import { IContainableProps, IContainableState, Containable } from 'mn-toolkit/containable/Containable';
import { VerticalStack } from 'mn-toolkit/container/VerticalStack';
import './styles.css';

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

  private onChange(value: T) {
    if (this.props.onSelect) this.props.onSelect(value);
  }

  public renderClasses(name?: string) {
    return super.renderClasses(name);
  }

  public render() {
    return this.renderAttributes(<VerticalStack>
      <select onChange={e => this.onChange(e.target.value as T)}>
        {this.props.options.map((option, iOption) => {
          return <option key={iOption} defaultValue={option} value={option} selected={option === this.props.defaultOption}>
            {this.props.optionsLabel ? this.props.optionsLabel[iOption] : option}
          </option>;
        })}
      </select>
    </VerticalStack>, 'mn-dropdown');
  }
}
