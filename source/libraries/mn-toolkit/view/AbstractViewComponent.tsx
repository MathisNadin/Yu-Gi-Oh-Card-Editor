import { Component } from 'react';
import { IContainerState } from '../container';

export interface IAbstractViewComponentState extends IContainerState {
  loaded: boolean;
}

export abstract class AbstractViewComponent<
  P,
  S extends IAbstractViewComponentState = IAbstractViewComponentState,
> extends Component<P, S> {
  protected onLoad?(): Promise<void>;
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

  public componentDidMount() {
    // console.log('Enter');
    if (this.onViewEnter) {
      this.onViewEnter()
        .then(() => {
          this.setState({ loaded: true });
        })
        .catch((e: Error) => app.$errorManager.trigger(e));
    }
  }

  public componentWillUnmount() {
    // console.log('Leave');
    if (this.onViewLeave) app.$errorManager.handlePromise(this.onViewLeave());
  }
}
