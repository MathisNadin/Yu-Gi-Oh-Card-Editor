import { ApiService } from './ApiService';

declare global {
  interface IApp {
    $api: ApiService;
  }
}
