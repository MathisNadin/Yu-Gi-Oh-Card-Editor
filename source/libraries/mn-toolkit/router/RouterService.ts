import { extend, isUndefined } from "libraries/mn-tools";
import { IRouterListener, IResolvedState, IState, IStateParameters, IStateCrumb } from ".";
import { Observable } from "../observable";

/**
 * Router service.
 */
export class RouterService extends Observable<IRouterListener> {

  // private historyCursor: number;
  private currentResolvedState!: IResolvedState;
  private states: { [name: string]: IState } = {};
  private resolving!: boolean;
  private history: IResolvedState[] = [];

  public goto: IRouter = {} as IRouter;

 /**
   * Return the current state.
   *
   * @returns {State}
   */
  public get currentState() {
    if (!this.currentResolvedState) return undefined;
    return this.currentResolvedState.state;
  }

  /**
   * Returns the parameters object for the current state.
   *
   * @returns parameters
   */
  public get parameters(): { [name: string]: string } {
    return this.currentResolvedState.parameters;
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



  /**
   * Default constructor.
   */
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



  public documentUrlToState(fallBackState?: keyof IRouter) {
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



  /**
   * Move the view to a new specific state.
   *
   * @param {State} state
   * @param {mixed} params
   */
  public go(stateName: string, params: object = {}) {
    this.go_async(stateName, params).catch(e => app.$errorManager.trigger(e));
  }

  public async go_async(stateName: string, params: object = {}) {
    let currentState = this.states[stateName];
    if (!currentState) throw new Error(`No state defined for ${stateName}`);
    let path = window.location.href.replace(/#.*$/, '') + '#!' + currentState.path;
    let qs: string[] = [];
    currentState.pathKeys.forEach(key => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (isUndefined((params as any)[key.name])) {
        if (!key.optional) throw new Error(`param '${key.name}' for route '${stateName}' is not optional`);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      let value = encodeURIComponent((params as any)[key.name]);
      if (key.type === 'path') {
        path = path.replace(':' + key.name, value);
      } else {
        qs.push(key.name + '=' + value);
      }
    });
    if (qs.length) path += '?' + qs.join('&');
    // if (path === location.href) return cb?cb(): undefined;

    if (this.currentResolvedState) {
      let message = this.fireStateWillLeave(this.currentResolvedState);
      if (!!message) {
        let response = await app.$popup.ask(message);
        if (!response) return;
      }
      window.history.replaceState(this.currentResolvedState.historyData, '', document.location.href);
    }

    window.history.pushState({}, '', path);
    this.history.push(this.currentResolvedState);
    let resolvedState = this.resolvePath();
    if (!resolvedState) {
      throw new Error(`no state for ${stateName}`);
    }
    resolvedState.parameters = params;
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
    this.go((this.currentState as IState).name, this.parameters);
  }




  private populateState(record: IState) {
    record.pathKeys = record.pathKeys || [];

    let iQs = record.path.indexOf('?');
    if (iQs !== -1) {
      record.path.substr(iQs + 1).split('&').forEach(q => {
        record.pathKeys.push({ name: q, type: 'qs', optional: true });
      });
      record.path = record.path.substr(0, iQs);

    }
    let path = record.path
      .replace(/:([a-zA-Z]+)/g, (_, key) => {
        record.pathKeys.push({ name: key, type: 'path', optional: false });
        return '([^/]+)';
      });

    record.regExp = new RegExp('^' + path + '$', 'i');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public register(name: keyof IRouter, path: string, component: any, options: Partial<IState> = {}) {
    // console.log('register', name, path, component.name);
    let route = {
      name,
      path,
      component,
    } as unknown as IState;
    if (options) extend(route, options);
    this.populateState(route);
    if (this.states[name]) throw new Error(`route ${name} already exists`);
    this.states[name] = route;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.goto as any)[name] = (props: object) => {
      this.go(name, props);
    };
    return route;
  }

  private getStatesTrail(stateName: string, parameters: IStateParameters): IResolvedState[] {
    let state = this.getByName(stateName);
    let rs: IResolvedState = {
      state,
      parameters,
      path: 'fake',
    };
    let parents: IResolvedState[] = [];
    if (rs.state.parentState) {
      parents = this.getStatesTrail(rs.state.parentState, {});
    }
    parents.unshift(rs);
    return parents;
  }

  private async buildBreadcrumb(): Promise<IStateCrumb[]> {
    let bc = this.getStatesTrail((this.currentState as IState).name, this.currentResolvedState.parameters);
    let last!: IResolvedState;
    for (const rc of bc) {
      if (last) rc.parameters = last.parentParameters || {};
      last = rc;
      if (!!rc.state.describe) await rc.state.describe(rc);
    }
    let result: IStateCrumb[] = bc.map(x => {
      return {
        state: x.state.name,
        parameters: x.parameters || {},
        title: x.title as string,
      };
    });
    result.reverse();
    return result;
  }




  private testState(eligible: IState, path: string): IResolvedState {
    let key;
    let val;

    let iqs = path.indexOf('?');
    let qs;
    if (iqs !== -1) {
      qs = path.substr(iqs + 1);
      path = path.substr(0, iqs);
    }
    let match = eligible.regExp.exec(path);
    if (!match) return null as unknown as IResolvedState;

    let state: IResolvedState = {
      path,
      state: eligible,
      parameters: {},
      historyData: {}
    };

    if (qs) {
      qs.split('&').forEach(q => {
        let [name, value] = q.split('=');
        state.parameters[name] = value;
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

      if (key) state.parameters[key.name] = val;
    }
    return state;
  }

  private processPath(_locationPath: string) {
    let match = /#(.*)$/.exec(window.location.href);
    return '/' + (match ? match[1] : '').replace(/[\/]*$/, '').replace(/^[\!\/]*/, '');
  }

  private resolvePath(): IResolvedState {
    let path = this.processPath(window.location.href);
    for (let routeName in this.states) {
      let resolvedState = this.testState(this.states[routeName], path);
      if (resolvedState) return resolvedState;
    }
    return undefined as unknown as IResolvedState;
  }

  public setHistoryState(name: string, value: string | number) {
    if (this.currentResolvedState.historyData) this.currentResolvedState.historyData[name] = value;
  }

  public getHistoryState(name: string) {
    return this.currentResolvedState.historyData ? this.currentResolvedState.historyData[name] : undefined;
  }

  private async resolveState(state: IResolvedState) {
    this.resolving = true;
    state.historyData = history.state || {};
    this.currentResolvedState = state;
    if (!!this.currentResolvedState.state.describe) await this.currentResolvedState.state.describe(state);
    let breadcrumb = await this.buildBreadcrumb();
    this.currentResolvedState.breadcrumb = breadcrumb;
    if (!!this.currentResolvedState.state.resolver) await this.currentResolvedState.state.resolver(this.currentResolvedState);
    // console.log('resolved, now go', this.currentResolvedState.path);
    this.resolving = false;
    this.fireStateChanged(this.currentResolvedState);
  }

}
