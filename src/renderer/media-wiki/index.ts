/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import { MediaWikiService } from './MediaWikiService';

declare global {
  interface IApp {
    $mediaWiki: MediaWikiService;
  }
}
