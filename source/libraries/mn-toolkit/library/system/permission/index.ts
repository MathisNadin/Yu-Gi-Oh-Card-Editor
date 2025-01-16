import { PermissionService } from './PermissionService';

export * from './PermissionService';

export interface IPermissions {
  [permission: string]: boolean;
}

declare global {
  interface IApp {
    $permission: PermissionService;
  }
}

export interface IPermissionListener {
  permissionLoaded(permissions: IPermissions, previous: IPermissions): void;
}
