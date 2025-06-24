import { extend, logger, AbstractObservable } from 'mn-tools';
import { IMemberAPILoginResponse, ISessionEntity } from 'api/main';
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
    if (!app.conf.sessionTokenName) return Promise.resolve();

    const token = app.$cookie.get(app.conf.sessionTokenName);
    const existingData = await app.$store.get<Partial<ISessionData>, TSessionStoreKey>('session');

    if (!token) {
      if (existingData) log.warning(`Suppression des données puisque nous n'avons pas de token`);
      return await this.drop();
    }

    log.debug('Nous avons un token:', token);

    if (existingData) log.debug('Nous avons des données:', existingData);
    else log.debug('Pas de données => tentative de reconnection avec le token');

    await this.restart(token, existingData || {});
  }

  public async restart(token: string, data: Partial<ISessionData>) {
    log.debug(`Redémarrage de la session avec le token ${token}`, data);

    let response: IMemberAPILoginResponse | undefined;
    try {
      response = await app.$api.member.authenticateToken({ token });
    } catch (e) {
      app.$errorManager.trigger(e as Error);
    }

    if (!response?.member) return await this.drop();

    data.member = response.member;
    data.roles = response.roles || [];
    data.permissions = response.permissions || [];
    await this.start(data);
  }

  public async start(data: Partial<ISessionData>, newToken?: ISessionEntity['token']) {
    log.debug('Starting session with data:', data);
    if (newToken && app.conf.sessionTokenName) {
      log.debug('Storing new token:', newToken);
      app.$cookie.set(app.conf.sessionTokenName, newToken);
    }
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
    if (app.conf.sessionTokenName) app.$cookie.delete(app.conf.sessionTokenName);
    await app.$store.remove<TSessionStoreKey>('session');
    this._data = undefined;
    await this.dispatchAsync('sessionDropped');
  }
}
