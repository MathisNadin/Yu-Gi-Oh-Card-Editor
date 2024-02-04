import { MediaWikiService } from './MediaWikiService';

export * from './MediaWikiService';

declare global {
  interface IApp {
    $mediaWiki: MediaWikiService;
  }
}
