import { isDefined, isString } from 'mn-tools';
import { IRouterHrefParams, TForegroundColor } from '../../system';
import { IContainableProps, IContainableState, Containable, TDidUpdateSnapshot } from '../containable';

interface IButtonLinkProps extends IContainableProps<HTMLAnchorElement> {
  label: string;
  href?: string | IRouterHrefParams;
  color?: TForegroundColor;
  pressed?: boolean;
}

interface IButtonLinkState extends IContainableState {
  pressed: boolean;
}

export class ButtonLink extends Containable<IButtonLinkProps, IButtonLinkState, HTMLAnchorElement> {
  public static override get defaultProps(): IButtonLinkProps {
    return {
      ...super.defaultProps,
      color: 'neutral',
      disabled: false,
      label: '',
    };
  }

  public constructor(props: IButtonLinkProps) {
    super(props);
    if (isDefined(props.pressed)) {
      this.state = { ...this.state, pressed: props.pressed as boolean };
    }
  }

  public override componentDidUpdate(
    prevProps: Readonly<IButtonLinkProps>,
    prevState: Readonly<IButtonLinkState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    if (this.props.pressed === this.state.pressed) return;
    this.setState({ pressed: this.props.pressed as boolean });
  }

  public override renderClasses() {
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

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    if (this.props.href) {
      if (isString(this.props.href)) {
        attributes.href = this.props.href;
      } else {
        attributes.href = app.$router.getLink(this.props.href);
      }
    }
    return attributes;
  }

  public override render() {
    return (
      <a {...this.renderAttributes()} ref={this.base}>
        {this.props.label}
      </a>
    );
  }
}
