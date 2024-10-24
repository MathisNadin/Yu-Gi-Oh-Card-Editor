import { PopoverService } from './PopoverService';
import { AbstractPopover, IAbstractPopoverProps } from './AbstractPopover';

export * from './PopoverService';
export * from './Popovers';
export * from './AbstractPopover';
export * from './ActionsPopover';
export * from './BubblePopover';
export * from './WalkthroughPopover';

export interface IPopoverListener {
  popoversChanged(): void;
}

export interface IPopoverOptions<P extends IAbstractPopoverProps> {
  eventOrRect: React.MouseEvent | DOMRect;
  type: string;
  Component: new (...args: P[]) => AbstractPopover;
  componentProps: P;
}

declare global {
  interface IApp {
    $popover: PopoverService;
  }
}
