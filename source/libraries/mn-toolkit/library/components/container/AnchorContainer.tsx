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
  hrefAttribute: AnchorHTMLAttributes<HTMLAnchorElement>['href'];
}

export class AnchorContainer<T extends TRouterState = TRouterState> extends Container<
  IAnchorContainerProps<T>,
  IAnchorContainerState,
  HTMLAnchorElement
> {
  public static override get defaultProps(): Omit<IAnchorContainerProps, 'href'> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
    };
  }

  public constructor(props: IAnchorContainerProps<T>) {
    super(props);

    let hrefAttribute: IAnchorContainerState['hrefAttribute'];
    if (isString(this.props.href)) {
      hrefAttribute = this.props.href;
    } else {
      hrefAttribute = app.$router.getLink(this.props.href);
    }

    this.state = {
      ...this.state,
      hrefAttribute,
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IAnchorContainerProps<T>>,
    prevState: Readonly<IAnchorContainerState>,
    snapshot?: TDidUpdateSnapshot
  ): void {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps.href === this.props.href) return;

    let hrefAttribute: IAnchorContainerState['hrefAttribute'];
    if (isString(this.props.href)) {
      hrefAttribute = this.props.href;
    } else {
      hrefAttribute = app.$router.getLink(this.props.href);
    }
    this.setState({ hrefAttribute });
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-anchor-container'] = true;
    return classes;
  }

  public override render(): TJSXElementChild {
    return (
      <a ref={this.base} {...this.renderAttributes()} href={this.state.hrefAttribute || undefined}>
        {this.inside}
      </a>
    );
  }
}
