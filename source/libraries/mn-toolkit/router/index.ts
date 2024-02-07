import { RouterService } from './RouterService';

export * from './RouterService';

declare global {
  interface IApp {
    $router: RouterService;
  }

  interface IRouter {
  }
}

export interface IStateCrumb {
  state: string,
  title: string
  parameters?: IStateParameters,
}


export interface IStateParameters {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [name: string]: any
}

export interface IResolvedState {
  path: string;
  state: IState;
  parameters: IStateParameters;
  historyData?: IStateParameters;
  title?: string;
  parentParameters?: IStateParameters;
  breadcrumb?: IStateCrumb[]
}


export interface IStatePathKey {
  name: string;
  optional: boolean;
  type: 'qs' | 'path'
}

export interface IState {
  name: string;
  path: string;
  pathKeys: IStatePathKey[];
  parentState?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any;
  params: IStateParameters;
  regExp: RegExp;
  resolver?: (state: IResolvedState) => Promise<void>;
  describe?: (state: IResolvedState) => Promise<void>;
}

export interface IRouterListener {
  routerStateWillLeave(resolvedState: IResolvedState): void;
  routerStateStart(resolvedState: IResolvedState): void;
  routerStateChanged(resolvedState: IResolvedState): void;
  routerStateLoaded(resolvedState: IResolvedState): void;
}
