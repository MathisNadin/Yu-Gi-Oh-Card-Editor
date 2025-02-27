import { isDefined, isString } from 'mn-tools';
import { IRouterHrefParams, TForegroundColor, TRouterState } from '../../system';
import { IContainableProps, IContainableState, Containable, TDidUpdateSnapshot } from '../containable';

interface IButtonLinkProps<T extends TRouterState = TRouterState> extends IContainableProps<HTMLAnchorElement> {
  label: string;
  href?: string | IRouterHrefParams<T>;
  color?: TForegroundColor;
  pressed?: boolean;
}

interface IButtonLinkState extends IContainableState {
  pressed?: boolean;
}

export class ButtonLink<T extends TRouterState = TRouterState> extends Containable<
  IButtonLinkProps<T>,
  IButtonLinkState,
  HTMLAnchorElement
> {
  public static override get defaultProps(): IButtonLinkProps {
    return {
      ...super.defaultProps,
      color: 'neutral',
      disabled: false,
      label: '',
    };
  }

  public constructor(props: IButtonLinkProps<T>) {
    super(props);
    this.state = {
      ...this.state,
      pressed: props.pressed!,
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IButtonLinkProps<T>>,
    prevState: Readonly<IButtonLinkState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    if (this.props.pressed === this.state.pressed) return;
    this.setState({ pressed: this.props.pressed! });
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
