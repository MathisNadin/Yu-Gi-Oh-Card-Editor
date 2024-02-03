import { MediaWikiService } from './MediaWikiService';

declare global {
  interface IApp {
    $mediaWiki: MediaWikiService;
  }
}
