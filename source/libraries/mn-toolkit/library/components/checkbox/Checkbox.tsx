import { Containable, IContainableProps, IContainableState, TDidUpdateSnapshot } from '../containable';
import { Typography } from '../typography';
import { Icon } from '../icon';

interface ICheckBoxProps extends IContainableProps {
  /** Text in front of the check box. */
  label: string;
  /** Value of the check box. */
  defaultValue?: boolean;
  /** Function when changes was detected */
  onChange?: (value: boolean) => void | Promise<void>;
  /** Position of the check box. */
  labelPosition?: 'left' | 'right';
  /** set the button to the specific style mn-checkbox-disabled. */
  disabled?: boolean;
}

interface ICheckBoxState extends IContainableState {
  value: boolean;
}

export class CheckBox extends Containable<ICheckBoxProps, ICheckBoxState> {
  public static override get defaultProps(): ICheckBoxProps {
    return {
      ...super.defaultProps,
      defaultValue: false,
      labelPosition: 'right',
      label: '',
    };
  }

  public constructor(props: ICheckBoxProps) {
    super(props);
    this.state = { ...this.state, value: props.defaultValue! };
  }

  public override componentDidUpdate(
    prevProps: Readonly<ICheckBoxProps>,
    prevState: Readonly<ICheckBoxState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    if (this.props.defaultValue === this.state.value) return;
    this.setState({ value: this.props.defaultValue! });
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-checkbox'] = true;
    if (this.state.value) classes['checked'] = true;
    if (this.props.labelPosition === 'left') classes['label-position-left'] = true;
    return classes;
  }

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    attributes.onClick = (e) => app.$errorManager.handlePromise(this.onTap(e));
    return attributes;
  }

  public override get children() {
    return [
      <Icon key='toggle' className='toggle' icon='toolkit-check-mark' />,
      !!this.props.label && <Typography key='label' className='label' content={this.props.label} variant='help' />,
    ];
  }

  private async onTap(e: React.MouseEvent<HTMLDivElement>) {
    if (this.props.disabled) return;
    await this.setStateAsync({ value: !this.state.value });
    if (this.props.onChange) await this.props.onChange(this.state.value);
    if (this.props.onTap) await this.props.onTap(e);
  }
}
