import { YuginewsService } from './YuginewsService';

declare global {
  interface IApp {
    $yuginews: YuginewsService;
  }
}
