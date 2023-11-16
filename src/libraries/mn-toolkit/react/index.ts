import { ReactService } from './ReactService';

export * from './ReactService';

declare global {
  interface IApp {
    $react: ReactService;
  }
}
