/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import { YuginewsService } from './YuginewsService';

declare global {
  interface IApp {
    $yuginews: YuginewsService;
  }
}
