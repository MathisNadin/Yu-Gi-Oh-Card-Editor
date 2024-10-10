import { CardService } from './CardService';

export * from './CardService';
export * from './card-interfaces';

declare global {
  interface IApp {
    $card: CardService;
  }
}
