import { logger, Observable } from 'mn-tools';
import { IPermissionListener } from '.';
import { ISessionListener } from '../session';

const log = logger('$permissions');

export class PermissionService extends Observable<IPermissionListener> implements Partial<ISessionListener> {
  private permissions?: Set<TPermission>;

  public async setup() {
    app.$session.addListener(this);
    return Promise.resolve();
  }

  public fireLoaded(permissions: Set<TPermission>, previous: Set<TPermission> | undefined) {
    this.dispatch('permissionLoaded', permissions, previous);
  }

  public sessionUpdated(sessionData: ISessionData) {
    this.load(sessionData.permissions);
  }

  public sessionDropped() {
    this.load([]);
  }

  public load(permissions: TPermission[]) {
    const previous = this.permissions;
    this.permissions = new Set(permissions);
    log.debug('Loading new permissions', permissions);
    this.fireLoaded(this.permissions, previous);
  }

  public hasPermission<P extends TPermission = TPermission>(permission: P) {
    if (!this.permissions) return false;
    return this.permissions.has(permission);
  }
}
