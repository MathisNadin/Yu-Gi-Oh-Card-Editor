import { extend, logger, AbstractObservable } from 'mn-tools';
import { IMemberAPILoginResponse } from 'api/main';
import { IDeviceListener } from '../device';
import { isXhrError } from '../xhr';
import { ISessionListener, TSessionStoreKey } from '.';

const log = logger('session');

/** Status codes that typically signal "network/offline" problems. */
const NETWORK_STATUS_CODES = [0, 502, 503, 504];

export class SessionService extends AbstractObservable<ISessionListener> implements Partial<IDeviceListener> {
  private _data?: ISessionData;

  /** True when an auth attempt is currently in progress, prevents duplicates. */
  private _authInProgress = false;

  /** True when the last auth failed *uniquely* pour raison réseau/offline. */
  private _needsTokenAuth = false;

  /* ---------- Public accessors ---------- */

  public get active() {
    return !!this._data;
  }

  public get data() {
    return this._data;
  }

  /* ---------- Device listener ---------- */

  public constructor() {
    super();
    app.$device.addListener(this);
  }

  /** Called by the DeviceService when connectivity is back. */
  public async deviceOnline() {
    if (!this._needsTokenAuth) return;
    log.debug('Device is online and token auth is pending → retrying auth');
    await this.setup(true);
  }

  /* ---------- Core logic ---------- */

  public async setup(retrying: boolean = false) {
    // On projects that don't have an API, then there can be no session anyway
    if (!app.conf.apiUrl) return;

    if (this._authInProgress && !retrying) return; // already running elsewhere
    this._authInProgress = true;
    this._needsTokenAuth = false; // reset, may be re-set below

    let response: IMemberAPILoginResponse | undefined;
    try {
      response = await app.$api.member.authenticateToken();
    } catch (e) {
      const err = e as Error;
      app.$errorManager.trigger(err);

      if (isXhrError(err) && NETWORK_STATUS_CODES.includes(err.statusCode)) {
        // Offline/network error → keep local session, mark for later retry
        log.debug('Network/offline error: keeping session locally');
        this._needsTokenAuth = true;
      } else {
        // Real auth error → drop session
        await this.drop();
        this._authInProgress = false;
        return;
      }
    }

    // If we got a response but no member data → token invalid
    if (response && !response.member) {
      await this.drop();
      this._authInProgress = false;
      return;
    }

    // Load existing session from storage
    const data = await app.$store.get<Partial<ISessionData>, TSessionStoreKey>('session', {});
    if (!data.member && !response) {
      log.debug('No local session and no authenticated response; no session started.');
      this._authInProgress = false;
      return;
    }

    if (response) {
      data.member = response.member;
      data.roles = response.roles || [];
      data.permissions = response.permissions || [];
    } else {
      data.roles = data.roles || [];
      data.permissions = data.permissions || [];
    }

    await this.start(data);
    this._authInProgress = false;
  }

  public async start(data: Partial<ISessionData>) {
    log.debug('Starting session with data:', data);
    await this.update(data);
    await this.dispatchAsync('sessionCreated', this._data!);
  }

  public async update(data: Partial<ISessionData>) {
    if (this._data) {
      extend(this._data, data);
    } else {
      this._data = data as ISessionData;
    }
    await this.dispatchAsync('sessionWillUpdate', data, this._data);

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
