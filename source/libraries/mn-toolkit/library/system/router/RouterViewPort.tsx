import { ReactElement, createElement } from 'react';
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
  private navVersion = 0;
  private currentContentKey?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private currentComponent?: ReactElement<any, any>;

  public static override get defaultProps(): IRouterViewPortProps {
    return {
      ...super.defaultProps,
      fill: true,
    };
  }

  public constructor(props: IRouterViewPortProps) {
    super(props);
    // When the user clicks on the browser's "back" or "forward" button
    // To account for pagination which changes the url without restarting a router state
    window.addEventListener('popstate', () => this.navVersion++);
    app.$router.addListener(this);
  }

  public routerStateStart() {
    this.navVersion = 0;
    this.forceUpdate();
  }

  public routerStateChanged() {
    this.forceUpdate();
  }

  public routerStateLoaded() {
    this.forceUpdate();
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

    const routerParameters = app.$router.getParameters();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { initialServerData, ...paramsWithoutData } = routerParameters;
    const routerKey = `${this.navVersion}${currentState.name}${serialize(paramsWithoutData)}`;
    const key = 'key' in routerParameters ? routerParameters.key : '';
    const newContentKey = `${key}${routerKey}content`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let content: ReactElement<any, any> | undefined;
    if (this.currentContentKey !== newContentKey) {
      content = createElement(currentState.component as unknown as string, { ...routerParameters, key: newContentKey });
      this.currentComponent = content;
      this.currentContentKey = newContentKey;
    } else {
      content = this.currentComponent;
    }

    log.debug('render', routerKey, content);
    return content;
  }
}
