import { Observable, extend, isUndefined } from 'mn-tools';
import {
  IRouterListener,
  IResolvedState,
  IState,
  IStateCrumb,
  TRouterState,
  IRouterHrefParams,
  TRouterParams,
} from '.';

export class RouterService extends Observable<IRouterListener> {
  private currentResolvedState!: IResolvedState;
  private states: { [name: string]: IState } = {};
  private resolving!: boolean;
  private history: IResolvedState[] = [];

  public goto: IRouter = {} as IRouter;

  public get currentState() {
    if (!this.currentResolvedState) return undefined;
    return this.currentResolvedState.state;
  }

  public getParameters<T extends TRouterState = TRouterState>() {
    return this.currentResolvedState.parameters as TRouterParams<T>;
  }

  public get hasHistory() {
    return !!this.history.length;
  }

  public get allStates() {
    return Object.values(this.states);
  }

  public get ready() {
    return !!this.currentState && !this.resolving;
  }

  public get resolvedState() {
    return this.currentResolvedState;
  }

  public get breadcrumb() {
    return this.resolvedState.breadcrumb;
  }

  public getByName(name: string) {
    return this.states[name];
  }

  public constructor() {
    super();
    window.addEventListener('hashchange', () => this.documentUrlToState());
  }

  private fireStateWillLeave(resolvedState: IResolvedState) {
    return this.askForResponse<string>('routerStateWillLeave', resolvedState);
  }

  private fireStateStart(resolvedState: IResolvedState) {
    this.dispatch('routerStateStart', resolvedState);
  }

  private fireStateChanged(resolvedState: IResolvedState) {
    this.dispatch('routerStateChanged', resolvedState);
  }

  private fireStateLoaded(resolvedState: IResolvedState) {
    this.dispatch('routerStateLoaded', resolvedState);
  }

  public documentUrlToState(fallBackState?: TRouterState) {
    let resolvedState = this.resolvePath();
    if (resolvedState) {
      app.$errorManager.handlePromise(this.resolveState(resolvedState));
    } else if (fallBackState) {
      this.go(fallBackState);
    }
  }

  public checkLocationState(stateName: string) {
    let resolvedState = this.resolvePath();
    if (!resolvedState) return false;
    return resolvedState.state.name === stateName;
  }

  public getLink(options: IRouterHrefParams) {
    let { state, params } = options;
    params = params || {};

    const currentState = this.states[state];
    if (!currentState) throw new Error(`No state defined for ${state}`);

    let path = window.location.href.replace(/#.*$/, '') + '#!' + currentState.path;
    let qs: string[] = [];
    for (const key of currentState.pathKeys) {
      const parameters = params as TRouterParams<TRouterState>;
      const keyName = key.name as keyof TRouterParams<TRouterState>;
      if (isUndefined(parameters[keyName])) {
        if (!key.optional) throw new Error(`param '${keyName}' for route '${state}' is not optional`);
        return;
      }

      const value = encodeURIComponent(parameters[keyName]);

      if (key.type === 'path') {
        path = path.replace(':' + key.name, value);
      } else {
        qs.push(key.name + '=' + value);
      }
    }

    if (qs.length) path += '?' + qs.join('&');

    return path;
  }

  public go<T extends TRouterState = TRouterState>(stateName: T, params?: TRouterParams<T>) {
    params = params || ({} as TRouterParams<T>);
    app.$errorManager.handlePromise(this.go_async(stateName, params));
  }

  public async go_async<T extends TRouterState = TRouterState>(stateName: T, params?: TRouterParams<T>) {
    params = params || ({} as TRouterParams<T>);
    const path = this.getLink({ state: stateName, params: params as TRouterParams<TRouterState> });
    if (this.currentResolvedState) {
      let message = this.fireStateWillLeave(this.currentResolvedState);
      if (!!message) {
        const confirm = await app.$popup.confirm(message);
        if (!confirm) return;
      }
      window.history.replaceState(this.currentResolvedState.historyData, '', document.location.href);
    }

    window.history.pushState({}, '', path);
    this.history.push(this.currentResolvedState);
    let resolvedState = this.resolvePath();
    if (!resolvedState) {
      throw new Error(`no state for ${stateName}`);
    }
    resolvedState.parameters = params as TRouterParams<TRouterState>;
    this.fireStateStart(resolvedState);
    await this.resolveState(resolvedState);
    app.$react.domReady(() => {
      this.fireStateLoaded(resolvedState);
    });
  }

  public async back() {
    if (!this.hasHistory) return;
    let rs = this.history.pop() as IResolvedState;
    this.fireStateChanged(rs);
    this.fireStateStart(rs);
    return await this.resolveState(rs);
  }

  public reload() {
    this.go((this.currentState as IState).name, this.getParameters());
  }

  private populateState(record: IState) {
    record.pathKeys = record.pathKeys || [];

    let iQs = record.path.indexOf('?');
    if (iQs !== -1) {
      record.path
        .substring(iQs + 1)
        .split('&')
        .forEach((q) => {
          record.pathKeys.push({ name: q, type: 'qs', optional: true });
        });
      record.path = record.path.substring(0, iQs);
    }
    let path = record.path.replace(/:([a-zA-Z]+)/g, (_, key) => {
      record.pathKeys.push({ name: key, type: 'path', optional: false });
      return '([^/]+)';
    });

    record.regExp = new RegExp('^' + path + '$', 'i');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public register(name: TRouterState, path: string, component: any, options: Partial<IState> = {}) {
    let route: IState = {
      name,
      path,
      component,
      params: undefined!,
      pathKeys: undefined!,
      regExp: undefined!,
    };
    if (options) extend(route, options);
    this.populateState(route);

    if (this.states[name]) throw new Error(`route ${name} already exists`);

    this.states[name] = route;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.goto as any)[name] = (props: object) => {
      this.go(name, props as TRouterParams<TRouterState>);
    };

    return route;
  }

  private getStatesTrail<T extends TRouterState = TRouterState>(
    stateName: T,
    parameters: TRouterParams<T>
  ): IResolvedState[] {
    let state = this.getByName(stateName);
    let rs: IResolvedState = {
      state,
      parameters: parameters as TRouterParams<TRouterState>,
      path: 'fake',
    };
    let parents: IResolvedState[] = [];
    if (rs.state.parentState) {
      parents = this.getStatesTrail(rs.state.parentState, {} as TRouterParams<TRouterState>);
    }
    parents.unshift(rs);
    return parents;
  }

  private async buildBreadcrumb(): Promise<IStateCrumb[]> {
    let bc = this.getStatesTrail((this.currentState as IState).name, this.currentResolvedState.parameters);
    let last!: IResolvedState;
    for (const rc of bc) {
      if (last) rc.parameters = (last.parentParameters as TRouterParams<TRouterState>) || {};
      last = rc;
      if (!!rc.state.describe) await rc.state.describe(rc);
    }
    let result: IStateCrumb[] = bc.map((x) => {
      return {
        state: x.state.name,
        parameters: x.parameters || {},
        title: x.title as string,
      };
    });
    result.reverse();
    return result;
  }

  private testState<T extends TRouterState = TRouterState>(
    eligible: IState<T>,
    path: string
  ): IResolvedState<T> | undefined {
    let key;
    let val;

    let iqs = path.indexOf('?');
    let qs;
    if (iqs !== -1) {
      qs = path.substring(iqs + 1);
      path = path.substring(0, iqs);
    }
    let match = eligible.regExp.exec(path);
    if (!match) return undefined;

    let state: IResolvedState<T> = {
      path,
      state: eligible,
      parameters: {} as TRouterParams<T>,
      historyData: {},
    };

    if (qs) {
      qs.split('&').forEach((q) => {
        let [name, value] = q.split('=');
        (state.parameters as { [key in typeof name]: string })[name] = value;
      });
    }

    // var paramIndex = 0;
    let len = match.length;
    for (let i = 1; i < len; ++i) {
      key = eligible.pathKeys[i - 1];
      try {
        val = 'string' === typeof match[i] ? decodeURIComponent(match[i]) : match[i];
      } catch (e) {
        throw new Error("Failed to decode param '" + match[i] + "'");
      }

      if (key) {
        (state.parameters as { [key in typeof key.name]: string })[key.name] = val;
      }
    }
    return state;
  }

  private processPath(_locationPath: string) {
    let match = /#(.*)$/.exec(window.location.href);
    return '/' + (match ? match[1] : '').replace(/[\/]*$/, '').replace(/^[\!\/]*/, '');
  }

  public resolvePath(): IResolvedState {
    let path = this.processPath(window.location.href);
    for (let routeName in this.states) {
      let resolvedState = this.testState(this.states[routeName], path);
      if (resolvedState) return resolvedState;
    }
    return undefined as unknown as IResolvedState;
  }

  public setHistoryState(name: string, value: string) {
    if (!this.currentResolvedState.historyData) return;
    const key = name as keyof TRouterParams<TRouterState>;
    (this.currentResolvedState.historyData as TRouterParams<TRouterState>)[key] = value;
  }

  public getHistoryState(name: string) {
    if (!this.currentResolvedState.historyData) return undefined;
    return (this.currentResolvedState.historyData as { [key in typeof name]: string })[name];
  }

  private async resolveState(state: IResolvedState) {
    this.resolving = true;
    state.historyData = history.state || {};
    this.currentResolvedState = state;
    if (!!this.currentResolvedState.state.describe) await this.currentResolvedState.state.describe(state);
    let breadcrumb = await this.buildBreadcrumb();
    this.currentResolvedState.breadcrumb = breadcrumb;
    if (!!this.currentResolvedState.state.resolver) {
      await this.currentResolvedState.state.resolver(this.currentResolvedState);
    }
    this.resolving = false;
    this.fireStateChanged(this.currentResolvedState);
  }
}
