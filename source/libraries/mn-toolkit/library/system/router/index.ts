import { THeadTag } from 'api/main';
import { RouterService } from './RouterService';

export * from './RouterService';
export * from './RouterViewPort';
export * from './404';

declare global {
  interface IApp {
    $router: RouterService;
  }

  interface Window {
    __INITIAL_SERVER_DATA__?: IResolvedState['parameters']['initialServerData'];
  }

  interface IRouter {}
}

export type TRouterState = keyof IRouter;

export type TRouterParams<T extends TRouterState> = IRouter[T] extends (options: infer P) => void
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    P & { initialServerData?: any }
  : never;

export interface IRouterHrefParams<T extends TRouterState = TRouterState> {
  state: T;
  params: TRouterParams<T>;
}

export interface IStateCrumb<T extends TRouterState = TRouterState> {
  title: string;
  state: T;
  parameters?: TRouterParams<T>;
}

export interface IResolvedState<T extends TRouterState = TRouterState, P extends TRouterState = TRouterState> {
  path: string;
  state: IState<T, P>;
  parameters: TRouterParams<T>;
  headTags: THeadTag[];
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TRouterComponent = React.ComponentClass<any, any>;

export interface IAbstractViewStaticFunctions {
  getInitialServerData?<T extends TRouterState>(params: TRouterParams<T>): Promise<Partial<TRouterParams<T>>>;
  getMetaTags?<T extends TRouterState>(params: TRouterParams<T>): THeadTag[];
  resolver?<T extends TRouterState>(state: IResolvedState<T>): Promise<void>;
}

export interface IState<T extends TRouterState = TRouterState, P extends TRouterState = TRouterState> {
  name: T;
  path: string;
  pathKeys: IStatePathKey[];
  parentState?: P;
  component: TRouterComponent;
  params: TRouterParams<T>;
  regExp: RegExp;
  fallbackState?: TRouterState;
  getInitialData?: (params: TRouterParams<T>) => Promise<Partial<TRouterParams<T>>>;
  getMetaTags?: (params: TRouterParams<T>) => THeadTag[];
  resolver?: (state: IResolvedState<T>) => Promise<void>;
}

export interface IRouterListener {
  routerStateWillLeave(resolvedState: IResolvedState): void;
  routerStateStart(resolvedState: IResolvedState): void;
  routerStateChanged(resolvedState: IResolvedState): void;
  routerStateLoaded(resolvedState: IResolvedState): void;
}
