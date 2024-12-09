export * from './CardBuilderService';
export * from './CardBuilder';
export * from './RushCardBuilder';

import { CardBuilderService } from './CardBuilderService';

declare global {
  interface IApp {
    $cardBuilder: CardBuilderService;
  }
}
