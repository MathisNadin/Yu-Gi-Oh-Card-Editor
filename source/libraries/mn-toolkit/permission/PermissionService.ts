import { logger, Observable } from 'mn-tools';
import { IPermissionListener, IPermissions } from '.';
import { ISessionListener } from '../session';

const log = logger('$permissions');

export class PermissionService extends Observable<IPermissionListener> implements Partial<ISessionListener> {
  private permissions!: IPermissions;

  public async setup() {
    app.$session.addListener(this);
    return Promise.resolve();
  }

  public fireLoaded(permissions: IPermissions, previous: IPermissions) {
    this.dispatch('permissionLoaded', permissions, previous);
  }

  public sessionUpdated() {
    this.load(app.$session.data.permissions);
  }

  public sessionDropped() {
    this.load([]);
  }

  public load(permissions: string[]) {
    let previous = this.permissions;
    this.permissions = {};
    permissions.forEach((p) => {
      this.permissions[p] = true;
    });
    log.debug('Chargement des permissions', permissions);
    this.fireLoaded(this.permissions, previous);
  }

  public hasPermission(permission: string) {
    let hasNot = false;
    if (permission[0] === '!') {
      hasNot = true;
      permission = permission.substring(1);
    }
    let result;
    if (!this.permissions) {
      result = false;
    } else {
      result = !!this.permissions[permission];
      if (hasNot) result = !result;
    }
    return result;
  }
}
