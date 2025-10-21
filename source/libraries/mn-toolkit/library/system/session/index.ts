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
  sessionWillUpdate: (addedData: Partial<ISessionData>, nextSessionData: ISessionData) => void | Promise<void>;
  sessionUpdated: (sessionData: ISessionData) => void | Promise<void>;
  sessionCreated: (sessionData: ISessionData) => void | Promise<void>;
  sessionDropped: () => void | Promise<void>;
}
