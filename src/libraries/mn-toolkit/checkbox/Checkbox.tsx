import './styles.scss';
import { classNames } from 'libraries/mn-tools';
import {
  Containable,
  IContainableProps,
  IContainableState
} from '../containable/Containable';
import { Typography } from '../typography/Typography';

interface ICheckBoxProps extends IContainableProps {
  /** Text in front of the check box. */
  label: string;
  /** Value of the check box. */
  defaultValue?: boolean;
  /** Function when changes was detected */
  onChange: (value: boolean) => void;
  /** Position of the check box. */
  labelPosition?: 'left' | 'right';
  /** set the button to the specific style mn-checkbox-disabled. */
  disabled?: boolean;
}

interface ICheckBoxState extends IContainableState {
  value: boolean;
}

export class CheckBox extends Containable<ICheckBoxProps, ICheckBoxState> {
  public static get defaultProps(): Partial<ICheckBoxProps> {
    return {
      ...super.defaultProps,
      defaultValue: false,
      labelPosition: 'right'
    };
  }

  public constructor(props: ICheckBoxProps) {
    super(props);
    this.setState({ value: props.defaultValue as boolean });
  }

  public componentWillReceiveProps(props: ICheckBoxProps) {
    if (props.defaultValue !== this.state.value) {
      this.setState({ value: props.defaultValue as boolean });
    }
  }

  public render() {
    return (
      <div
        className={classNames(this.renderClasses('mn-checkbox'), {
          checked: this.state.value,
          'label-position-left': this.props.labelPosition === 'left'
        })}
        onClick={() => this.onClick()}
      >
        <div className="toggle"></div>
        {!!this.props.label && <Typography content={this.props.label} variant='help' />}
      </div>
    );
  }

  private onClick() {
    if (this.props.disabled) return;
    this.setState({ value: !this.state.value });
    if (this.props.onChange) this.props.onChange(this.state.value);
  }
}
