import { isDefined, classNames } from 'mn-tools';
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
    if (isDefined(props.pressed)) {
      this.state = { ...this.state, pressed: props.pressed as boolean };
    }
  }

  public componentDidUpdate() {
    if (this.props.pressed === this.state.pressed) return;
    this.setState({ pressed: this.props.pressed as boolean });
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-button-link'] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;

    if (isDefined(this.state.pressed)) {
      if (this.state.pressed) {
        classes['mn-button-pressed'] = true;
      } else {
        classes['mn-button-unpressed'] = true;
      }
    }

    return classes;
  }

  public render() {
    return (
      <div
        id={this.props.nodeId}
        title={this.props.hint}
        className={classNames(this.renderClasses())}
        onClick={
          !this.props.onTap
            ? undefined
            : (e) => {
                app.$errorManager.handlePromise(this.props.onTap!(e));
              }
        }
      >
        {!!this.props.label && <span className='label'>{this.props.label}</span>}
      </div>
    );
  }
}
