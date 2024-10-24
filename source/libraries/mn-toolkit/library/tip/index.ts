import { TipService } from './TipService';

export * from './TipService';

declare global {
  interface IApp {
    $tips: TipService;
  }
}
