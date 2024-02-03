import { PopoverService } from './PopoverService';

export * from './PopoverService';
export * from './PopoverContent';

declare global {
  interface IApp {
    $popover: PopoverService;
  }
}
