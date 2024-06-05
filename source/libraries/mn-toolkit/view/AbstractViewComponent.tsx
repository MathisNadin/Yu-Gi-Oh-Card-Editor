import { Component } from 'react';
import { IContainerState } from '../container';

export interface IAbstractViewComponentState extends IContainerState {
  loaded: boolean;
}

export abstract class AbstractViewComponent<
  P,
  S extends IAbstractViewComponentState = IAbstractViewComponentState,
> extends Component<P, S> {
  protected onViewEnter?(): Promise<void>;
  protected onViewLeave?(): Promise<void>;

  protected get isLoaded() {
    return this.state.loaded;
  }

  public constructor(props: P, state?: Partial<S>) {
    super(props);

    if (state) {
      state.loaded = false;
      this.state = state as S;
    } else {
      this.state = { loaded: false } as S;
    }
  }

  public async setStateAsync(newState: Partial<S>) {
    return new Promise<void>((resolve) => this.setState(newState as S, resolve));
  }

  public componentDidMount() {
    if (this.onViewEnter) {
      this.onViewEnter()
        .then(() => {
          this.setState({ loaded: true });
        })
        .catch((e: Error) => app.$errorManager.trigger(e));
    }
  }

  public componentWillUnmount() {
    if (this.onViewLeave) app.$errorManager.handlePromise(this.onViewLeave());
  }
}
