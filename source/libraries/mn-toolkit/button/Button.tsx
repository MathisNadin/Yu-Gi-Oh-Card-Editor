import { IContainableProps, Containable, IContainableState } from '../containable';
import { TBackgroundColor, TForegroundColor } from '../themeSettings';
import { Icon, TIconId } from '../icon';

interface IButtonProps extends IContainableProps {
  label: string;
  color?: TForegroundColor;
  bg?: TBackgroundColor;
  block?: boolean;
  icon?: TIconId;
  iconPosition?: 'left' | 'right';
}

interface IButtonState extends IContainableState {}

export class Button extends Containable<IButtonProps, IButtonState> {
  public static get defaultProps(): Partial<IButtonProps> {
    return {
      ...super.defaultProps,
      block: false,
      disabled: false,
      color: 'neutral',
      iconPosition: 'left',
    };
  }

  public constructor(props: IButtonProps) {
    super(props);
  }

  public renderClasses(name?: string) {
    let classes = super.renderClasses(name);
    if (this.props.block) classes['mn-button-block'] = true;
    if (this.props.color) classes[`mn-button-color-${this.props.color}`] = true;
    if (this.props.bg) classes[`mn-button-bg-${this.props.bg}`] = true;
    classes['mn-button-icon-and-text'] = !!this.props.icon && !!this.props.label;
    classes[`mn-icon-position-${this.props.iconPosition}`] = true;
    return classes;
  }

  public render() {
    return this.renderAttributes(
      <div>
        {this.props.icon && <Icon className='icon' size={18} iconId={this.props.icon} />}
        {!!this.props.label && <span className='label'>{this.props.label}</span>}
      </div>,
      'mn-button'
    );
  }
}
