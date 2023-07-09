/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import { ApiService } from './ApiService';

declare global {
  interface IApp {
    $api: ApiService;
  }
}
