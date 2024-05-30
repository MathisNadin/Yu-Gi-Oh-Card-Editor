import { IMemberEntity } from 'api/main';
import { SessionService } from './SessionService';

export * from './SessionService';

declare global {
  interface IApp {
    $session: SessionService;
  }
  interface ISessionData {
    member: IMemberEntity;
  }
}

export interface ISessionListener {
  sessionUpdated(): void;
  sessionCreated(): void;
  sessionDropped(): void;
}
