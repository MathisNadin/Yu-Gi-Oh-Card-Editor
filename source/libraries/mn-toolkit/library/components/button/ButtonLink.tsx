import { isDefined, isString } from 'mn-tools';
import { IRouterHrefParams, TForegroundColor, TRouterState } from '../../system';
import { IContainableProps, IContainableState, Containable } from '../containable';

interface IButtonLinkProps<T extends TRouterState = TRouterState> extends IContainableProps<HTMLAnchorElement> {
  label: string;
  href?: string | IRouterHrefParams<T>;
  color?: TForegroundColor;
  pressed?: boolean;
}

interface IButtonLinkState extends IContainableState {}

export class ButtonLink<T extends TRouterState = TRouterState> extends Containable<
  IButtonLinkProps<T>,
  IButtonLinkState,
  HTMLAnchorElement
> {
  public static override get defaultProps(): Omit<IButtonLinkProps, 'label'> {
    return {
      ...super.defaultProps,
      color: 'neutral',
      disabled: false,
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-button-link'] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;

    if (isDefined(this.props.pressed)) {
      if (this.props.pressed) {
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
        attributes.href = this.props.href || undefined;
      } else {
        attributes.href = app.$router.getLink(this.props.href) || undefined;
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
