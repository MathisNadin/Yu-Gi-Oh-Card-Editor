import { AbstractObservable, uuid } from 'mn-tools';
import { TJSXElementChild } from '../../system';
import { IAbstractPopoverProps } from './AbstractPopover';
import { ActionsPopover, IActionsPopoverProps } from './ActionsPopover';
import { BubblePopover, IBubblePopoverProps } from './BubblePopover';
import { WalkthroughPopover, IWalkthroughPopoverProps } from './WalkthroughPopover';
import { IPopoverListener, IPopoverOptions } from '.';

export class PopoverService extends AbstractObservable<IPopoverListener> {
  public popovers: { id: string; element: TJSXElementChild; options: IPopoverOptions<IAbstractPopoverProps> }[];
  public focuses: { popoverId: string; targetRectangle: DOMRect }[];

  public constructor() {
    super();
    this.popovers = [];
    this.focuses = [];
    app.$device.addListener({
      deviceBackButton: () => app.$popover.removeLast(),
    });
  }

  public get visible() {
    return !!this.popovers.length;
  }

  public get hasOverlay() {
    return !!this.focuses.length || !!this.popovers.find((p) => p.options.componentProps.overlay);
  }

  public actions<ID = number>(eventOrRect: React.MouseEvent | DOMRect, props: IActionsPopoverProps<ID>) {
    return this.show<IActionsPopoverProps<ID>>({
      eventOrRect,
      type: 'actions',
      Component: ActionsPopover<ID>,
      componentProps: props,
    });
  }

  public bubble(eventOrRect: React.MouseEvent | DOMRect, props: IBubblePopoverProps) {
    return this.show<IBubblePopoverProps>({
      eventOrRect,
      type: 'bubble',
      Component: BubblePopover,
      componentProps: props,
    });
  }

  public walkthrough(eventOrRect: React.MouseEvent | DOMRect, props: IWalkthroughPopoverProps) {
    return this.show<IWalkthroughPopoverProps>({
      eventOrRect,
      type: 'walkthrough',
      Component: WalkthroughPopover,
      componentProps: props,
    });
  }

  public show<P extends IAbstractPopoverProps>(options: IPopoverOptions<P>) {
    const { Component, componentProps, type } = options;
    if (!componentProps.targetRectangle) {
      if ('target' in options.eventOrRect) {
        const targetElement = options.eventOrRect.target as HTMLElement;
        componentProps.targetRectangle = targetElement?.getBoundingClientRect();
      } else {
        componentProps.targetRectangle = options.eventOrRect;
      }
    }
    if (!componentProps.targetRectangle) throw new Error('No target rectangle provided');

    const id = `${type}-${this.popovers.length + 1}-${uuid()}`;
    const popoverElement = <Component {...componentProps} key={id} id={id} type={type} />;
    this.popovers.push({
      id,
      element: popoverElement,
      options: options as unknown as IPopoverOptions<IAbstractPopoverProps>,
    });
    if (componentProps.focus) {
      this.focuses.push({ popoverId: id, targetRectangle: componentProps.targetRectangle });
    }
    this.dispatch('popoversChanged');
    return id;
  }

  public remove(id: string) {
    this.popovers = this.popovers.filter((p) => p.id !== id);
    this.focuses = this.focuses.filter((p) => p.popoverId !== id);
    this.dispatch('popoversChanged');
  }

  public removeLast() {
    if (!this.popovers.length) return;
    const lastId = this.popovers[this.popovers.length - 1]!.id;
    this.remove(lastId);
  }

  public removeAll() {
    this.popovers = [];
    this.focuses = [];
    this.dispatch('popoversChanged');
  }
}
