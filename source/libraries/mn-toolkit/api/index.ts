import { ApiService } from './ApiService';

export * from './ApiService';

declare global {
  interface IApp {
    $api: ApiService;
  }
}
