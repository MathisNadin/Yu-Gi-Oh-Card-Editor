import {
  Observable,
  extend,
  isBoolean,
  isNumber,
  isObject,
  isString,
  isUndefined,
  serialize,
  unserialize,
} from 'mn-tools';
import { THeadTag, IHeadLinkTag, IHeadTitleTag, IHeadMetaTag } from 'api/main';
import {
  IRouterListener,
  IResolvedState,
  IState,
  IStateCrumb,
  TRouterState,
  IRouterHrefParams,
  TRouterParams,
  TRouterComponent,
  IAbstractViewStaticFunctions,
} from '.';

type TRouterStates<T extends TRouterState = TRouterState, P extends TRouterState = TRouterState> = {
  [name in T]?: IState<T, P>;
};

export class RouterService extends Observable<IRouterListener> {
  private currentResolvedState?: IResolvedState;
  private states: TRouterStates = {};
  private resolving = false;
  private history: IResolvedState[] = [];

  private _defaultHeadTags: THeadTag[] = [];
  public set defaultHeadTags(tags: THeadTag[]) {
    this._defaultHeadTags = tags || [];
  }

  public goto: IRouter = {} as IRouter;

  private _fallbackState?: TRouterState;
  public get fallbackState(): TRouterState | undefined {
    return this._fallbackState;
  }
  public set fallbackState(state: TRouterState) {
    this._fallbackState = state;
  }

  public get currentState() {
    if (!this.currentResolvedState) return undefined;
    return this.currentResolvedState.state;
  }

  public getParameters<T extends TRouterState = TRouterState>() {
    return this.currentResolvedState?.parameters as unknown as TRouterParams<T>;
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
    return this.resolvedState?.breadcrumb;
  }

  public getByName<T extends TRouterState = TRouterState>(name: T) {
    return this.states[name];
  }

  public constructor() {
    super();
    // When the user clicks on the browser's "back" or "forward" button
    window.addEventListener('popstate', () => app.$errorManager.handlePromise(this.documentUrlToState()));
    document.addEventListener('click', (event) => {
      if (!(event.target instanceof HTMLElement)) return;

      const link = event.target.closest('a');
      if (!link) return;

      // 1) Check if same origin
      const url = new URL(link.href, window.location.origin);
      if (url.origin !== window.location.origin) return;

      // 2) Try to resolve state frm link.href
      const nextState = this.resolveStateFromPath(link.href);
      if (!nextState) return;

      // 3) If it's an internal link -> intercept
      event.preventDefault();
      app.$errorManager.handlePromise(this.goResolved(nextState));
    });
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

  public async documentUrlToState(fallbackState?: TRouterState) {
    fallbackState = fallbackState || this.fallbackState;
    const resolvedState = this.resolveStateFromPath();
    if (resolvedState) {
      await this.resolveState(resolvedState);
    } else if (fallbackState) {
      await this.go(fallbackState);
    }
  }

  public checkLocationState(stateName: string) {
    const resolvedState = this.resolveStateFromPath();
    if (!resolvedState) return false;
    return resolvedState.state.name === stateName;
  }

  // To get easily when needed (mostly for apps not served by a server)
  public static get baseUrlWithHash() {
    return `${window.location.href.replace(/#.*$/, '')}#!`;
  }

  // Buld path, while handling the case if a root path
  public buildPath(path: string) {
    const cleanBaseUrl = app.conf.baseUrl.replace(/[\/]*$/, '');
    if (path === '/') return cleanBaseUrl;
    return `${cleanBaseUrl}/${path.replace(/^[\/]+|[\/]+$/g, '')}/`;
  }

  public getLink<T extends TRouterState = TRouterState>(options: IRouterHrefParams<T>, ignoreQs: boolean = false) {
    const currentState = this.states[options.state];
    if (!currentState) throw new Error(`No state defined for ${options.state}`);

    let parameters: TRouterParams<TRouterState>;
    if (options.params) {
      parameters = options.params as unknown as TRouterParams<TRouterState>;
    } else {
      parameters = {} as TRouterParams<TRouterState>;
    }

    let path = this.buildPath(currentState.path);
    const qs: string[] = [];
    for (const key of currentState.pathKeys) {
      const keyName = key.name as keyof TRouterParams<TRouterState>;
      const param = parameters[keyName];

      if (isUndefined(param)) {
        if (!key.optional) throw new Error(`param '${keyName}' for route '${options.state}' is not optional`);
        else continue;
      }

      let value = '';
      if (isString(param) || isNumber(param) || isBoolean(param)) {
        // Typing trick
        value = encodeURIComponent(param as string | number | boolean);
      }

      if (key.type === 'path') {
        path = path.replace(`:${key.name}`, value);
      } else if (!ignoreQs && key.type === 'qs') {
        qs.push(`${key.name}=${value}`);
      }
    }

    if (qs.length) path += '?' + qs.join('&');

    return path;
  }

  // Update the current URL without reloading the current view
  public updateUrl<T extends TRouterState = TRouterState>(state: T, params?: TRouterParams<T>) {
    // Makes no sense to get here without a current state
    if (!this.currentResolvedState) return;

    // 1) Merge params and get new path
    params = {
      ...(this.currentResolvedState.parameters as unknown as TRouterParams<T>),
      ...params,
    };
    const path = this.getLink({ state, params });
    if (!path) {
      console.warn(`updateUrl : cannot find path "${state}"`);
      return;
    }

    // 2) Only makes sense if there is a currently resolved state
    window.history.replaceState(this.currentResolvedState.historyData, '', document.location.href);

    // 3) Push new URL in history
    window.history.pushState({}, '', path);
    this.history.push(this.currentResolvedState);

    // 4) Resolve new state
    const resolvedState = this.resolveStateFromPath(path);
    if (!resolvedState) throw new Error(`No state for ${state}`);

    // 5) Update current resolved state with the new one
    resolvedState.historyData = history.state || {};
    resolvedState.parameters = params as unknown as TRouterParams<TRouterState>;
    this.currentResolvedState = resolvedState;

    const breadcrumb = this.buildBreadcrumb();
    this.currentResolvedState.breadcrumb = breadcrumb;
  }

  private async checkCanLeave() {
    if (!this.currentResolvedState) return true;

    const message = this.fireStateWillLeave(this.currentResolvedState);
    if (message) {
      const confirm = await app.$popup.confirm(message);
      if (!confirm) return false;
    }

    return true;
  }

  public async go<T extends TRouterState = TRouterState>(state: T, params?: TRouterParams<T>) {
    if (!(await this.checkCanLeave())) return;

    params = params || ({} as TRouterParams<T>);
    const path = this.getLink({ state, params });
    if (!path) throw new Error(`No path for ${state}`);

    // Only makes sense if there is a currently resolved state
    if (this.currentResolvedState) {
      window.history.replaceState(this.currentResolvedState.historyData, '', document.location.href);
    }

    window.history.pushState({}, '', path);
    if (this.currentResolvedState) this.history.push(this.currentResolvedState);

    const resolvedState = this.resolveStateFromPath(path);
    if (!resolvedState) throw new Error(`No state for ${state}`);

    resolvedState.parameters = params as unknown as TRouterParams<TRouterState>;
    return this.finishNavigation(resolvedState);
  }

  /**
   * Direct navigation from an already resolvedState
   */
  private async goResolved<T extends TRouterState = TRouterState>(resolvedState: IResolvedState<T>) {
    if (!(await this.checkCanLeave())) return;

    // Only makes sense if there is a currently resolved state
    if (this.currentResolvedState) {
      window.history.replaceState(this.currentResolvedState.historyData, '', document.location.href);
    }

    const path = this.getLink({ state: resolvedState.state.name, params: resolvedState.parameters });
    if (!path) throw new Error(`No path for ${resolvedState.state.name}`);

    window.history.pushState({}, '', path);
    if (this.currentResolvedState) this.history.push(this.currentResolvedState);

    await this.finishNavigation(resolvedState);
  }

  /**
   * Finalize navigation (trigger events, etc.)
   */
  private async finishNavigation<T extends TRouterState = TRouterState>(resolvedState: IResolvedState<T>) {
    this.fireStateStart(resolvedState);
    await this.resolveState(resolvedState);
    app.$react.domReady(() => this.fireStateLoaded(resolvedState));
  }

  public async back() {
    if (!this.hasHistory) return;
    const rs = this.history.pop()!;
    this.fireStateChanged(rs);
    this.fireStateStart(rs);
    return await this.resolveState(rs);
  }

  public async reload() {
    await this.go(this.currentState!.name, this.getParameters());
  }

  private populateState<T extends TRouterState = TRouterState, P extends TRouterState = TRouterState>(
    record: IState<T, P>
  ) {
    record.pathKeys = record.pathKeys || [];

    const iQs = record.path.indexOf('?');
    if (iQs !== -1) {
      record.path
        .substring(iQs + 1)
        .split('&')
        .forEach((q) => {
          record.pathKeys.push({ name: q, type: 'qs', optional: true });
        });
      record.path = record.path.substring(0, iQs);
    }

    const path = record.path.replace(/:([a-zA-Z]+)/g, (_, key) => {
      record.pathKeys.push({ name: key, type: 'path', optional: false });
      return '([^/]+)';
    });

    record.regExp = new RegExp(`^${path}\$`, 'i');
  }

  public register<T extends TRouterState = TRouterState, P extends TRouterState = TRouterState>(
    name: T,
    path: string,
    component: TRouterComponent,
    options?: Partial<IState<T, P>>
  ) {
    const route: IState<T, P> = {
      name,
      path: path || '/',
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
    (this.goto as any)[name] = async (props: TRouterParams<T>) => {
      await this.go(name, props);
    };

    return route;
  }

  private getStatesTrail<T extends TRouterState = TRouterState>(
    stateName: T,
    parameters: TRouterParams<T>,
    headTags: THeadTag[]
  ): IResolvedState[] {
    const state = this.getByName(stateName) as IState<T>;
    const rs: IResolvedState<T> = {
      state,
      parameters,
      path: 'fake',
      headTags,
    };

    let parents: IResolvedState[] = [];
    if (rs.state.parentState) {
      parents = this.getStatesTrail(rs.state.parentState, {} as TRouterParams<TRouterState>, []);
    }
    parents.unshift(rs);
    return parents;
  }

  private buildBreadcrumb(): IStateCrumb[] {
    const bc = this.getStatesTrail(
      this.currentState!.name,
      this.currentResolvedState!.parameters,
      this.currentResolvedState!.headTags
    );

    let last!: IResolvedState;
    for (const rc of bc) {
      if (last) rc.parameters = (last.parentParameters as TRouterParams<TRouterState>) || {};
      last = rc;
    }

    const result: IStateCrumb[] = bc.map((x) => {
      return {
        state: x.state.name,
        parameters: x.parameters || {},
        title: x.title || '',
      };
    });
    return result.reverse();
  }

  private testState<T extends TRouterState = TRouterState>(
    eligible: IState<T>,
    path: string
  ): IResolvedState<T> | undefined {
    let key;
    let val;

    const iqs = path.indexOf('?');
    let qs;
    if (iqs !== -1) {
      qs = path.substring(iqs + 1);
      path = path.substring(0, iqs);
    }

    const match = eligible.regExp.exec(path);
    if (!match) return undefined;

    const state: IResolvedState<T> = {
      path,
      state: eligible,
      parameters: {} as TRouterParams<T>,
      historyData: {},
      headTags: [],
    };

    if (qs) {
      qs.split('&').forEach((q) => {
        let [name, value] = q.split('=');
        (state.parameters as { [key in typeof name]: string })[name] = value;
      });
    }

    for (let i = 1; i < match.length; ++i) {
      key = eligible.pathKeys[i - 1];
      try {
        val = isString(match[i]) ? decodeURIComponent(match[i]) : match[i];
      } catch {
        throw new Error(`Failed to decode param '${match[i]}'`);
      }

      if (key) {
        (state.parameters as { [key in typeof key.name]: string })[key.name] = val;
      }
    }
    return state;
  }

  // Handle a root path by default
  private processPath(locationPath: string) {
    return locationPath.replace(app.conf.baseUrl, '') || '/';
  }

  public resolveStateFromPath(locationPath: string = window.location.href) {
    const path = this.processPath(locationPath);

    for (const routeName in this.states) {
      const state = this.states[routeName as TRouterState];
      if (!state) continue;

      const resolvedState = this.testState(state, path);
      if (resolvedState) return resolvedState;
    }

    return undefined;
  }

  public setHistoryState(name: string, value: string) {
    if (!this.currentResolvedState?.historyData) return;
    const key = name as keyof TRouterParams<TRouterState>;
    (this.currentResolvedState.historyData as { [key in keyof TRouterParams<TRouterState>]: string })[key] = value;
  }

  public getHistoryState(name: string) {
    if (!this.currentResolvedState?.historyData) return undefined;
    return (this.currentResolvedState.historyData as { [key in typeof name]: string })[name];
  }

  private getInitialServerData() {
    const data = window.__INITIAL_SERVER_DATA__;
    if (!data) return data;

    delete window.__INITIAL_SERVER_DATA__;

    const script = document.querySelector('script#initial-server-data');
    if (script) script.remove();

    // To recreate Date objects
    return isObject(data) ? unserialize(serialize(data)) : data;
  }

  private async resolveState(state: IResolvedState) {
    this.resolving = true;

    // Retrieve current state name, if any, to handle an eventual error
    const oldState = this.currentResolvedState?.state?.name;

    // Retrieve current tags, may be undefined if currently resolving the first state when loading the app
    const oldHeadTags = this.currentResolvedState?.headTags;

    // Wrap this function to use fallbackState
    try {
      // Update current resolved state with the new one
      state.historyData = history.state || {};
      this.currentResolvedState = state;

      // Check if we have server data
      this.currentResolvedState.parameters.initialServerData = this.getInitialServerData();

      const AbstractViewComponent = this.currentResolvedState.state.component as IAbstractViewStaticFunctions;

      // If not, and getInitialServerData is defined, use that instead
      if (!this.currentResolvedState.parameters.initialServerData && AbstractViewComponent.getInitialServerData) {
        this.currentResolvedState.parameters.initialServerData = await AbstractViewComponent.getInitialServerData(
          this.currentResolvedState.parameters
        );
      }

      // Get view-specific metatags
      if (AbstractViewComponent.getMetaTags) {
        state.headTags = AbstractViewComponent.getMetaTags(state.parameters);
      } else {
        // If no meta tags => use default tags + add canonical link (path without query strings)
        const noQsPath = this.getLink(
          { state: this.currentResolvedState.state.name, params: this.currentResolvedState.parameters },
          true
        )!;
        const canonicalLink: IHeadLinkTag = { tagName: 'link', rel: 'canonical', href: noQsPath };
        state.headTags = [...this._defaultHeadTags, canonicalLink];
      }
      this.updateDomHead(state.headTags, oldHeadTags);

      const breadcrumb = this.buildBreadcrumb();
      this.currentResolvedState.breadcrumb = breadcrumb;
      this.resolving = false;
      this.fireStateChanged(this.currentResolvedState);
    } catch (e) {
      // If anything breaks, pivot to fallbackState if it's a different state
      app.$errorManager.trigger(e as Error);
      this.resolving = false;
      const fallbackState = state.state.fallbackState || this.fallbackState;
      if (fallbackState && fallbackState !== oldState) {
        await this.go(fallbackState);
      }
    }
  }

  private areHeadTagsDifferent(newHeadTags: THeadTag[], oldHeadTags: THeadTag[] | undefined): boolean {
    if (!oldHeadTags || oldHeadTags.length !== newHeadTags.length) return true;

    // Simplified strategy: serialize and compare
    const serializeTag = (tag: THeadTag) => JSON.stringify(tag);
    const oldSorted = oldHeadTags.map(serializeTag).sort();
    const newSorted = newHeadTags.map(serializeTag).sort();

    for (let i = 0; i < oldSorted.length; i++) {
      if (oldSorted[i] !== newSorted[i]) return true;
    }

    return false;
  }

  private isHeadTitleTag(headTag: THeadTag): headTag is IHeadTitleTag {
    return headTag.tagName === 'title';
  }

  private isHeadMetaTag(headTag: THeadTag): headTag is IHeadMetaTag {
    return headTag.tagName === 'meta';
  }

  private isHeadLinkTag(headTag: THeadTag): headTag is IHeadLinkTag {
    return headTag.tagName === 'link';
  }

  private updateDomHead(newHeadTags: THeadTag[], previousHeadTags: THeadTag[] | undefined) {
    // 1) Check if there's any difference between old and new tags
    const changed = this.areHeadTagsDifferent(newHeadTags, previousHeadTags);
    if (!changed) return;

    let newTitleTag: IHeadTitleTag | undefined;
    const newMetaTags: IHeadMetaTag[] = [];
    const newLinkTags: IHeadLinkTag[] = [];

    // 2) Sort tags
    for (const headTag of newHeadTags) {
      if (this.isHeadTitleTag(headTag)) newTitleTag = headTag;
      else if (this.isHeadMetaTag(headTag)) newMetaTags.push(headTag);
      else if (this.isHeadLinkTag(headTag)) newLinkTags.push(headTag);
    }

    // 4) Update or create the <title> tag
    this.updateTitleTag(newTitleTag);

    // 3) Update the <meta> tags
    this.updateMetaTags(newMetaTags);

    // 5) Update the <link> tags
    this.updateLinkTags(newLinkTags);
  }

  /**
   * Updates the <title> tag if present in the newHeadTags.
   * Creates it if it doesn't exist, or leaves it if no new title is specified.
   */
  private updateTitleTag(newTitleTag: IHeadTitleTag | undefined) {
    // If no title -> nothing to act upon
    if (!newTitleTag?.title) return;

    // If the title is the same -> nothing to change
    if (newTitleTag.title === document.title) return;

    // Finally, update the document title
    document.title = newTitleTag.title;
  }

  /**
   * Updates <meta> tags by matching 'name' or 'property' and adjusting 'content'.
   * Removes old meta tags that are not matched, and creates new ones that don't match any old tag.
   */
  private updateMetaTags(newMetaTags: IHeadMetaTag[]) {
    // Gather all previously managed meta tags in the DOM
    const oldManagedMeta = Array.from(document.head.querySelectorAll('meta[data-router="true"]'));

    // We'll keep track of new meta tags that match existing ones
    const matchedNewTags: Set<IHeadMetaTag> = new Set();

    // (a) Match and update
    for (const oldMeta of oldManagedMeta) {
      const oldName = oldMeta.getAttribute('name');
      const oldProperty = oldMeta.getAttribute('property');

      // Find a new meta tag that matches by name or property
      const matchedTag = newMetaTags.find((metaTag) => {
        if (metaTag.name && metaTag.name === oldName) return true;
        if (metaTag.property && metaTag.property === oldProperty) return true;
        return false;
      });

      if (matchedTag) {
        // Update content if needed
        if (oldMeta.getAttribute('content') !== matchedTag.content) {
          oldMeta.setAttribute('content', matchedTag.content);
        }
        matchedNewTags.add(matchedTag);
      }
    }

    // (b) Remove old meta tags that did not match
    for (const oldMeta of oldManagedMeta) {
      const oldName = oldMeta.getAttribute('name');
      const oldProperty = oldMeta.getAttribute('property');

      const stillMatched = newMetaTags.some((newTag) => {
        if (!matchedNewTags.has(newTag)) return false;
        if (newTag.name && newTag.name === oldName) return true;
        if (newTag.property && newTag.property === oldProperty) return true;
        return false;
      });

      if (!stillMatched) {
        oldMeta.remove();
      }
    }

    // (c) Create and append the new meta tags that were not matched
    for (const metaTag of newMetaTags) {
      if (matchedNewTags.has(metaTag)) continue; // Already updated an old tag

      // Create the <meta> element
      const metaEl = document.createElement('meta');

      if (metaTag.name) metaEl.setAttribute('name', metaTag.name);
      if (metaTag.property) metaEl.setAttribute('property', metaTag.property);

      metaEl.setAttribute('content', metaTag.content);
      metaEl.setAttribute('data-router', 'true');

      document.head.appendChild(metaEl);
    }
  }

  /**
   * Updates <link> tags by matching 'rel' and 'href'.
   * Removes old link tags that are not matched, and creates new ones that don't match any old tag.
   */
  private updateLinkTags(newLinkTags: IHeadLinkTag[]) {
    // Gather all previously managed link tags in the DOM
    const oldManagedLinks = Array.from(document.head.querySelectorAll('link[data-router="true"]'));

    // We'll keep track of new link tags that match existing ones
    const matchedNewTags: Set<IHeadLinkTag> = new Set();

    // (a) Match and update
    for (const oldLink of oldManagedLinks) {
      const oldRel = oldLink.getAttribute('rel');
      const oldHref = oldLink.getAttribute('href');

      // Find a new link tag that matches by rel + href
      const matchedTag = newLinkTags.find((linkTag) => {
        return linkTag.rel === oldRel && linkTag.href === oldHref;
      });

      if (matchedTag) {
        // No content to update except if we wanted to do something else
        matchedNewTags.add(matchedTag);
      }
    }

    // (b) Remove old link tags that did not match
    for (const oldLink of oldManagedLinks) {
      const oldRel = oldLink.getAttribute('rel');
      const oldHref = oldLink.getAttribute('href');

      const stillMatched = newLinkTags.some((newTag) => {
        if (!matchedNewTags.has(newTag)) return false;
        if (newTag.rel === oldRel && newTag.href === oldHref) return true;
        return false;
      });

      if (!stillMatched) {
        oldLink.remove();
      }
    }

    // (c) Create and append the new link tags that were not matched
    for (const linkTag of newLinkTags) {
      if (matchedNewTags.has(linkTag)) continue; // Already updated an old tag

      // Create the <link> element
      const linkEl = document.createElement('link');
      linkEl.setAttribute('rel', linkTag.rel);
      linkEl.setAttribute('href', linkTag.href);
      linkEl.setAttribute('data-router', 'true');

      document.head.appendChild(linkEl);
    }
  }
}
