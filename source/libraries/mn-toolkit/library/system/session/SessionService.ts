import { extend, logger, AbstractObservable } from 'mn-tools';
import { IMemberAPILoginResponse } from 'api/main';
import { ISessionListener, TSessionStoreKey } from '.';

const log = logger('session');

export class SessionService extends AbstractObservable<ISessionListener> {
  private _data?: ISessionData;

  public get active() {
    return !!this._data;
  }

  public get data() {
    return this._data;
  }

  public async setup() {
    // On projects that don't have an API, then there can be no session anyway
    if (!app.conf.apiUrl) return;

    let response: IMemberAPILoginResponse | undefined;
    try {
      response = await app.$api.member.authenticateToken();
    } catch (e) {
      app.$errorManager.trigger(e as Error);
    }

    if (!response?.member) return await this.drop();

    const data = await app.$store.get<Partial<ISessionData>, TSessionStoreKey>('session', {});
    data.member = response.member;
    data.roles = response.roles || [];
    data.permissions = response.permissions || [];
    await this.start(data);
  }

  public async start(data: Partial<ISessionData>) {
    log.debug('Starting session with data:', data);
    await this.update(data);
    await this.dispatchAsync('sessionCreated', this._data!);
  }

  public async update(data: Partial<ISessionData>) {
    if (this._data) extend(this._data, data);
    else this._data = data as ISessionData;
    await app.$store.set<ISessionData, TSessionStoreKey>('session', this._data);
    await this.dispatchAsync('sessionUpdated', this._data);
  }

  public async drop() {
    log.debug('Dropping session');
    if (app.conf.apiUrl) {
      try {
        await app.$api.member.logout();
      } catch (e) {
        app.$errorManager.trigger(e as Error);
      }
    }
    await app.$store.remove<TSessionStoreKey>('session');
    this._data = undefined;
    await this.dispatchAsync('sessionDropped');
  }
}
