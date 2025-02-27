import { PermissionService } from './PermissionService';

export * from './PermissionService';

declare global {
  interface IApp {
    $permission: PermissionService;
  }
}

export interface IPermissionListener {
  permissionLoaded(permissions: Set<TPermission>, previous: Set<TPermission> | undefined): void;
}
