import { classNames } from 'mn-tools';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { Typography } from '../typography';

interface ICheckBoxProps extends IContainableProps {
  /** Text in front of the check box. */
  label: string;
  /** Value of the check box. */
  defaultValue?: boolean;
  /** Function when changes was detected */
  onChange: (value: boolean) => void | Promise<void>;
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
      labelPosition: 'right',
    };
  }

  public constructor(props: ICheckBoxProps) {
    super(props);
    this.state = { ...this.state, value: props.defaultValue! };
  }

  public componentDidUpdate(prevProps: ICheckBoxProps) {
    if (prevProps === this.props) return;
    if (this.props.defaultValue === this.state.value) return;
    this.setState({ value: this.props.defaultValue! });
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-checkbox'] = true;
    if (this.state.value) classes['checked'] = true;
    if (this.props.labelPosition === 'left') classes['label-position-left'] = true;
    return classes;
  }

  public render() {
    return (
      <div className={classNames(this.renderClasses())} onClick={() => app.$errorManager.handlePromise(this.onClick())}>
        <div className='toggle'></div>
        {!!this.props.label && <Typography className='label' content={this.props.label} variant='help' />}
      </div>
    );
  }

  private async onClick() {
    if (this.props.disabled) return;
    await this.setStateAsync({ value: !this.state.value });
    if (this.props.onChange) {
      app.$errorManager.handlePromise(this.props.onChange(this.state.value));
    }
  }
}
