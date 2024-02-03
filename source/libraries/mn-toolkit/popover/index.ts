import { PopoverService } from './PopoverService';

export * from './PopoverService';
export * from './PopoverContent';
export * from './interfaces';

declare global {
  interface IApp {
    $popover: PopoverService;
  }
}
