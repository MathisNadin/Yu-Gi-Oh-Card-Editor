import { CookieService } from './CookieService';

export * from './CookieService';

declare global {
  interface IApp {
    $cookie: CookieService;
  }
}
