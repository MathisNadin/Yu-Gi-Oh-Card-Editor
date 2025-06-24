import { logger, AbstractObservable } from 'mn-tools';
import { IPermissionListener } from '.';
import { ISessionListener } from '../session';

const log = logger('$permissions');

export class PermissionService extends AbstractObservable<IPermissionListener> implements Partial<ISessionListener> {
  private permissions?: Set<TPermission>;

  public async setup() {
    app.$session.addListener(this);
    return Promise.resolve();
  }

  public async sessionUpdated(sessionData: ISessionData) {
    await this.load(sessionData.permissions);
  }

  public async sessionDropped() {
    await this.load([]);
  }

  public async load(permissions: TPermission[]) {
    const previous = this.permissions;
    this.permissions = new Set(permissions);
    log.debug('Loading new permissions', permissions);
    await this.dispatchAsync('permissionLoaded', this.permissions, previous);
  }

  public hasPermission<P extends TPermission = TPermission>(permission: P) {
    if (!this.permissions) return false;
    return this.permissions.has(permission);
  }
}
