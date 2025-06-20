import { Containable, IContainableProps, IContainableState } from '../containable';
import { Typography } from '../typography';
import { Icon } from '../icon';

export interface ICheckboxProps extends IContainableProps {
  /** Text in front of the check box. */
  label: string;
  /** Controlled value of the checkbox. */
  value: boolean;
  /** Function called when value changes. */
  onChange: (value: boolean) => void | Promise<void>;
  /** Position of the check box. */
  labelPosition?: 'left' | 'right';
}

interface ICheckboxState extends IContainableState {}

export class Checkbox extends Containable<ICheckboxProps, ICheckboxState> {
  public static override get defaultProps(): Omit<ICheckboxProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      labelPosition: 'right',
      label: '',
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-checkbox'] = true;
    classes['checked'] = !!this.props.value;
    return classes;
  }

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    attributes.onClick = (e) => app.$errorManager.handlePromise(this.onTap(e));
    return attributes;
  }

  public override get children() {
    return [
      !!this.props.label && this.props.labelPosition === 'left' && (
        <Typography key='label-left' className='label' content={this.props.label} variant='help' />
      ),
      <Icon key='toggle' className='toggle' icon='toolkit-check-mark' />,
      !!this.props.label && this.props.labelPosition === 'right' && (
        <Typography key='label-right' className='label' content={this.props.label} variant='help' />
      ),
    ];
  }

  private async onTap(e: React.MouseEvent<HTMLDivElement>) {
    if (this.props.disabled) return;
    if (this.props.onTap) await this.props.onTap(e);
    await this.props.onChange(!this.props.value);
  }
}
