import { Component, DOMElement, createElement } from 'react';
import { logger, serialize } from 'mn-tools';
import { Containable, IContainableProps, IContainableState, Spinner } from '../../components';
import { IRouterListener } from '.';

const log = logger('router');

interface IRouterViewPortProps extends IContainableProps {
  withLeftMargin?: boolean;
}

interface IRouterViewPortState extends IContainableState {}

export class RouterViewPort
  extends Containable<IRouterViewPortProps, IRouterViewPortState>
  implements Partial<IRouterListener>
{
  private currentContentKey!: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private currentComponent!: DOMElement<any, any>;

  public constructor(props: IRouterViewPortProps) {
    super(props);
    this.state = { ...this.state, loaded: false };
    app.$router.addListener(this);
  }

  public routerStateChanged() {
    this.setState({ loaded: false });
  }

  public routerStateLoaded() {
    this.setState({ loaded: true });
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-router'] = true;
    classes['loaded'] = this.state.loaded;
    classes['with-left-margin'] = !!this.props.withLeftMargin;
    return classes;
  }

  public override get children() {
    if (!app.$router.ready) return <Spinner key='not-ready-state' />;

    const currentState = app.$router.currentState!;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let c: Component<any, any> = currentState.component;
    const routerParameters = app.$router.getParameters() as object;
    const routerKey = `${currentState.name}${serialize(routerParameters)}`;
    const key = 'key' in routerParameters ? routerParameters.key : '';
    const newContentKey = `${key}${routerKey}content`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let content: DOMElement<any, any>;
    if (this.currentContentKey !== newContentKey) {
      content = createElement(c as unknown as string, { ...routerParameters, key: newContentKey });
      this.currentComponent = content;
      this.currentContentKey = newContentKey;
    } else {
      content = this.currentComponent;
    }

    log.debug('render', routerKey, content);
    return content;
  }
}
