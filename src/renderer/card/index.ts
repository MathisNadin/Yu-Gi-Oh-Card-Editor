import { CardService } from "./CardService";

declare global {
  interface IApp {
    $card: CardService;
  }
}
