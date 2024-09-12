import { extend, logger, Observable } from 'mn-tools';
import { ISessionListener } from '.';

const log = logger('session');

interface ISessionOptions {
  apiUrl: string;
}

export interface IApiRestResponse {
  ok: boolean;
  message: string;
  field: string;
  code: string;
}

export class SessionService extends Observable<ISessionListener> {
  private options: ISessionOptions = {} as ISessionOptions;
  private _active: boolean;
  private _token: string;
  private _data: ISessionData = {} as unknown as ISessionData;

  public constructor() {
    super();
    this._token = undefined!;
    this._data = undefined!;
    this._active = false;
  }

  public fireSessionCreated() {
    this.dispatch('sessionCreated');
  }

  public fireSessionDropped() {
    this.dispatch('sessionDropped');
  }

  public fireSessionUpdated() {
    this.dispatch('sessionUpdated');
  }

  public async setup() {
    this._token = await app.$store.get('token');
    this._data = await app.$store.get('session');
    if (this._token) {
      log.debug('Nous avons un token:', this._token);
      if (this._data) {
        log.debug('Nous avons des données:', this._data);
        await this.start(this._token, this._data, true);
      } else {
        log.debug(`Pas de data, il faudrait une tentative de reconnection avec le token ${this._token}`);
      }
    } else {
      if (this._data) {
        log.warning(`Suppression des données puisque nous n'avons pas de token`);
      }
      this.drop();
    }
  }

  public get active(): boolean {
    return !!this._active;
  }

  public async update(data: Partial<ISessionData>) {
    extend(this._data, data);
    await app.$store.set('session', this._data);
    this.fireSessionUpdated();
  }

  public get data(): ISessionData {
    return this._data;
  }

  public get token() {
    return this._token;
  }

  public async start(token: string, data: ISessionData, fromPreexistingData = false) {
    // MN : des fois on passe this._data en argument data, donc on utilise newData pour ne pas l'affecter
    // quand on fait ensuite "await app.$store.set('session', this._data = {} as ISessionData);"
    const newData = data;
    log.debug(`Démarrage de la session avec le token ${token}`, newData);
    await app.$store.set('token', (this._token = token));
    await app.$store.set('session', (this._data = {} as ISessionData));
    this._active = true;

    // If from preexisting data (retrieved from storage during initial setup) then we update the entire member
    if (fromPreexistingData && newData.member) {
      try {
        const [member] = await app.$api.member.list({ oids: [newData.member.oid] });
        if (!member) return this.drop();
        newData.member = member;

        const response = await app.$api.member.getPermissions({
          member: newData.member.oid,
          applicationInstance: newData.member.applicationInstance,
        });
        newData.roles = response.roles;
        newData.permissions = response.permissions;
      } catch (e) {
        // We may have data, but if the session's expired this will fail, so we drop the session
        app.$errorManager.trigger(e as Error);
        return this.drop();
      }
    }

    await this.update(newData);
    this.fireSessionCreated();
    this.fireSessionUpdated();
  }

  public drop() {
    log.debug('drop');
    this._active = false;
    this._token = undefined!;
    this._data = undefined!;
    app.$store.remove('token');
    app.$store.remove('session');
    this.fireSessionDropped();
  }

  public configure(options: Partial<ISessionOptions>) {
    extend(this.options, options);
  }
}
