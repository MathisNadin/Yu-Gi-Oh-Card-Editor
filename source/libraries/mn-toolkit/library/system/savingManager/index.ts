import { SavingManagerService } from './SavingManagerService';

export * from './SavingManagerService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ISaveJob<E = any> {
  id?: string | number;
  payload: E;
  handler: (payload?: E) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TSaver<E = any> = (jobOrFunction: ISaveJob<E> | (() => Promise<void>)) => void;

export type TSavingStatus = 'unsaved' | 'saved' | 'saving';

declare global {
  interface IApp {
    $savingManager: SavingManagerService;
  }
}

export interface ISavingManagerListener {
  onSavingManagerStatusChanged(status: TSavingStatus): void;
}
