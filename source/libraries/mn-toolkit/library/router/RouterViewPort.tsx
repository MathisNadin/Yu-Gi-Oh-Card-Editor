import { Component, DOMElement, createElement } from 'react';
import { IRouterListener } from '.';
import { Spinner } from '../spinner';
import { classNames, logger } from 'mn-tools';

const log = logger('router');

interface IRouterViewPortProps {
  className?: string;
  withLeftMargin?: boolean;
}

interface IRouterViewPortState {
  loaded: boolean;
}

export class RouterViewPort
  extends Component<IRouterViewPortProps, IRouterViewPortState>
  implements Partial<IRouterListener>
{
  private currentContentKey!: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private currentComponent!: DOMElement<any, any>;

  public static get defaultProps(): Partial<IRouterViewPortProps> {
    return {
      className: '',
    };
  }

  public constructor(props: IRouterViewPortProps) {
    super(props);
    this.state = { loaded: false } as IRouterViewPortState;
    app.$router.addListener(this);
  }

  public routerStateChanged() {
    this.setState({ loaded: false });
  }

  public routerStateLoaded() {
    this.setState({ loaded: true });
  }

  public override render() {
    const currentState = app.$router.currentState!;
    if (!app.$router.ready) {
      return (
        <div>
          <Spinner />
        </div>
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let c: Component<any, any> = currentState.component;
    const routerParameters = app.$router.getParameters() as object;
    const routerKey = `${currentState.name}${JSON.stringify(routerParameters)}`;
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
    return (
      <div
        key={routerKey}
        className={classNames(
          'mn-router',
          {
            loaded: this.state.loaded,
            'with-left-margin': this.props.withLeftMargin,
          },
          this.props.className
        )}
      >
        {content}
      </div>
    );
  }
}
