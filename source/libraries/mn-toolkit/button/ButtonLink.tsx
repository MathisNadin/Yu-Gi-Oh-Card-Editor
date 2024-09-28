import { isDefined } from 'mn-tools';
import { IContainableProps, IContainableState, Containable, TDidUpdateSnapshot } from '../containable';
import { TForegroundColor } from '../theme';
import { AllHTMLAttributes } from 'react';
import { IRouterHrefParams } from 'mn-toolkit/router';

interface IButtonLinkProps extends IContainableProps {
  label: string;
  href?: IRouterHrefParams;
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

  public renderAttributes(): AllHTMLAttributes<HTMLElement> {
    const attributes = super.renderAttributes();
    if (this.props.href) {
      attributes.href = app.$router.getLink(this.props.href);
    }
    return attributes;
  }

  public override render() {
    return <a {...this.renderAttributes()}>{this.props.label}</a>;
  }
}
