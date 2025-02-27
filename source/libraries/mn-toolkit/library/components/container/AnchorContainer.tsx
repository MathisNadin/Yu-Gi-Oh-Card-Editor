import { AnchorHTMLAttributes } from 'react';
import { isString } from 'mn-tools';
import { IRouterHrefParams, TJSXElementChild, TRouterState } from '../../system';
import { IContainerProps, IContainerState, Container } from './Container';
import { TDidUpdateSnapshot } from '../containable';

export interface IAnchorContainerProps<T extends TRouterState = TRouterState>
  extends IContainerProps<HTMLAnchorElement> {
  href: string | IRouterHrefParams<T>;
}

interface IAnchorContainerState extends IContainerState {
  href: AnchorHTMLAttributes<HTMLAnchorElement>['href'];
}

export class AnchorContainer<T extends TRouterState = TRouterState> extends Container<
  IAnchorContainerProps<T>,
  IAnchorContainerState,
  HTMLAnchorElement
> {
  public static override get defaultProps(): IAnchorContainerProps {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      href: '',
    };
  }

  public constructor(props: IAnchorContainerProps<T>) {
    super(props);

    let href: IAnchorContainerState['href'];
    if (isString(this.props.href)) {
      href = this.props.href;
    } else {
      href = app.$router.getLink(this.props.href);
    }

    this.state = {
      ...this.state,
      href,
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IAnchorContainerProps<T>>,
    prevState: Readonly<IAnchorContainerState>,
    snapshot?: TDidUpdateSnapshot
  ): void {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps.href === this.props.href) return;

    let href: IAnchorContainerState['href'];
    if (isString(this.props.href)) {
      href = this.props.href;
    } else {
      href = app.$router.getLink(this.props.href);
    }
    this.setState({ href });
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-anchor-container'] = true;
    return classes;
  }

  public override render(): TJSXElementChild {
    return (
      <a ref={this.base} {...this.renderAttributes()} href={this.state.href}>
        {this.inside}
      </a>
    );
  }
}
