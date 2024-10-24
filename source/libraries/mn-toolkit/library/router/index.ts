import { RouterService } from './RouterService';

export * from './RouterService';
export * from './RouterViewPort';
export * from './404';

declare global {
  interface IApp {
    $router: RouterService;
  }

  interface IRouter {}
}

export type TRouterState = keyof IRouter;

export type TRouterParams<T extends TRouterState> = IRouter[T] extends (options: infer P) => void ? P : never;

export interface IRouterHrefParams<T extends TRouterState = TRouterState> {
  state: T;
  params: TRouterParams<T>;
}

export interface IStateCrumb<T extends TRouterState = TRouterState> {
  title: string;
  state: T;
  parameters?: TRouterParams<T>;
}

export interface IResolvedState<T extends TRouterState = TRouterState> {
  path: string;
  state: IState;
  parameters: TRouterParams<T>;
  historyData?: object;
  title?: string;
  parentParameters?: object;
  breadcrumb?: IStateCrumb[];
}

export interface IStatePathKey {
  name: string;
  optional: boolean;
  type: 'qs' | 'path';
}

export interface IState<T extends TRouterState = TRouterState, P extends TRouterState = TRouterState> {
  name: T;
  path: string;
  pathKeys: IStatePathKey[];
  parentState?: P;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any;
  params: TRouterParams<T>;
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
