import './styles.scss';
import { Containable, IContainableProps, IContainableState } from '../containable/Containable';
import { TForegroundColor, TBackgroundColor } from '../themeSettings';
import { TIconId } from '../icon';

interface IButtonIconProps extends IContainableProps {
  icon: TIconId;
  color?: TForegroundColor;
  pressed: boolean;
  bg?: TBackgroundColor;
  /** Set badge of the button. */
  badge?: number;
  size?: 'normal' | 'small';
}

interface IButtonIconState extends IContainableState {
}

export class ButtonIcon extends Containable<IButtonIconProps, IButtonIconState> {

  public static get defaultProps(): Partial<IButtonIconProps> {
    return {
      ...super.defaultProps,
      color: 'neutral',
      disabled: false,
      pressed: false,
      size: 'normal',
    };
  }

  public constructor(props: IButtonIconProps) {
    super(props);
  }

  public renderClasses(name?: string) {
    let classes = super.renderClasses(name);
    classes['mn-button-icon-pressed'] = this.props.pressed;
    classes[`mn-size-${this.props.size}`] = true;
    classes[`mn-color-${this.props.color}`] = true;
    classes[`mn-bg-${this.props.bg}`] = true;
    return classes;
  }

  public render() {
    const icon = app.$icon.get(this.props.icon);
    return this.renderAttributes(<div>
      {!!this.props.icon && <div className="icon">{icon}</div>}
      {!!this.props.badge && <div className="mn-badge mn-badge-top-right">{this.props.badge}</div>}
    </div>, 'mn-button-icon');
  }
}
