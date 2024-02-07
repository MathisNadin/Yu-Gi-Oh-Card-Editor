import { Component, createElement } from 'react';
import { IRouterListener, IState } from '..';
import { Spinner } from '../spinner';
import { classNames } from 'libraries/mn-tools';

interface IRouterViewPortProps {
  className?: string;
}

interface IRouterViewPortState {
  loaded: boolean;
  fragment: string;
}

export class RouterViewPort extends Component<IRouterViewPortProps, IRouterViewPortState> implements Partial<IRouterListener> {

  public static get defaultProps() : Partial<IRouterViewPortProps> {
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
    // console.log('changed');
    this.setState({ loaded: false });
  }

  public routerStateLoaded() {
    this.setState({ loaded: true });
  }

  public render() {
    const currentState = app.$router.currentState as IState;
    if (!app.$router.ready) return <div><Spinner /></div>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c: Component<any, any> = currentState.component;
    const key = currentState.name + JSON.stringify(app.$router.parameters);
    const content = createElement(c as unknown as string, app.$router.parameters);
    // console.log('render', key, content);

    return <div key={key} className={classNames({ ['loaded']: this.state.loaded }, 'an-router', this.props.className)}>
      {content}
    </div>;
  }

}
