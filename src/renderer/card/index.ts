/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import { CardService } from "./CardService";

declare global {
  interface IApp {
    $card: CardService;
  }
}
