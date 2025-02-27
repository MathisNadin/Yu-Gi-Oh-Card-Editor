import { IMemberEntity, IRoleEntity } from 'api/main';
import { SessionService } from './SessionService';

export * from './SessionService';

declare global {
  interface IApp {
    $session: SessionService;
  }

  interface ISessionData {
    member: IMemberEntity;
    roles: IRoleEntity['oid'][];
    permissions: TPermission[];
  }
}

export type TSessionStoreKey = 'session';

export interface ISessionListener {
  sessionUpdated: (sessionData: ISessionData) => void;
  sessionCreated: (sessionData: ISessionData) => void;
  sessionDropped: () => void;
}
