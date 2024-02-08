import { isDefined, classNames } from 'libraries/mn-tools';
import { IContainableProps, IContainableState, Containable } from '../containable';
import { TForegroundColor } from '../themeSettings';

interface IButtonLinkProps extends IContainableProps {
  label: string;
  color?: TForegroundColor;
  pressed?: boolean;
}

interface IButtonLinkState extends IContainableState {
  pressed: boolean;
}

export class ButtonLink extends Containable<IButtonLinkProps, IButtonLinkState> {
  public static get defaultProps(): Partial<IButtonLinkProps> {
    return {
      ...super.defaultProps,
      color: 'neutral',
      disabled: false,
    };
  }

  public constructor(props: IButtonLinkProps) {
    super(props);
    if (isDefined(props.pressed)) this.setState({ pressed: props.pressed });
  }

  public componentDidUpdate() {
    if (this.props.pressed !== this.state.pressed) {
      this.setState({ pressed: this.props.pressed as boolean });
    }
  }

  public render() {
    return (
      <div
        id={this.props.nodeId}
        title={this.props.hint}
        onClick={(e) => {
          if (this.props.onTap) app.$errorManager.handlePromise(this.props.onTap(e));
        }}
        className={classNames(
          this.renderClasses('mn-button-link'),
          this.props.className,
          isDefined(this.state.pressed) ? `mn-button-${this.state.pressed ? 'pressed' : 'unpressed'}` : null,
          `mn-button-color-${this.props.color}`
        )}
      >
        {!!this.props.label && <span className='label'>{this.props.label}</span>}
      </div>
    );
  }
}
