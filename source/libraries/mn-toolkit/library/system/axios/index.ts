import { AxiosService } from './AxiosService';

export * from './AxiosService';

declare global {
  interface IApp {
    $axios: AxiosService;
  }
}
