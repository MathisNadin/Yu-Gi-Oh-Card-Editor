import { IMemberEntity, IPermission, IRoleEntity } from 'api/main';
import { SessionService } from './SessionService';

export * from './SessionService';

declare global {
  interface IApp {
    $session: SessionService;
  }

  interface ISessionData {
    member: IMemberEntity;
    roles: IRoleEntity['oid'][];
    permissions: IPermission['permission'][];
  }
}

export interface ISessionListener {
  sessionUpdated(): void;
  sessionCreated(): void;
  sessionDropped(): void;
}
