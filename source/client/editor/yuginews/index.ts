import { YuginewsService } from './YuginewsService';

export * from './YuginewsService';

declare global {
  interface IApp {
    $yuginews: YuginewsService;
  }
}
