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
    app.$router.addListener({
      routerStateChanged: () => app.$popover.removeAll(),
    });
  }

  public get visible() {
    return !!this.popovers.length;
  }

  public get hasOverlay() {
    return !!this.focuses.length || !!this.popovers.find((p) => p.options.componentProps.overlay);
  }

  public actions<ID = number>(eventOrElement: React.MouseEvent | HTMLElement, props: IActionsPopoverProps<ID>) {
    return this.show<IActionsPopoverProps<ID>>({
      eventOrElement,
      type: 'actions',
      Component: ActionsPopover<ID>,
      componentProps: props,
    });
  }

  public bubble(eventOrElement: React.MouseEvent | HTMLElement, props: IBubblePopoverProps) {
    return this.show<IBubblePopoverProps>({
      eventOrElement,
      type: 'bubble',
      Component: BubblePopover,
      componentProps: props,
    });
  }

  public walkthrough(eventOrElement: React.MouseEvent | HTMLElement, props: IWalkthroughPopoverProps) {
    return this.show<IWalkthroughPopoverProps>({
      eventOrElement,
      type: 'walkthrough',
      Component: WalkthroughPopover,
      componentProps: props,
    });
  }

  public show<P extends IAbstractPopoverProps>(options: IPopoverOptions<P>) {
    const { Component, componentProps, type, eventOrElement } = options;

    // 1. React SyntheticEvent
    if (eventOrElement && typeof eventOrElement === 'object' && 'nativeEvent' in eventOrElement) {
      // Parfois le target est sur nativeEvent, parfois directement sur l'event
      componentProps.targetElement = (eventOrElement.nativeEvent?.target ?? eventOrElement.target) as HTMLElement;
    }
    // 2. Native Event DOM
    else if (typeof Event !== 'undefined' && eventOrElement instanceof Event) {
      componentProps.targetElement = eventOrElement.target as HTMLElement;
    }
    // 3. Direct HTMLElement/Element
    else if (
      (typeof HTMLElement !== 'undefined' && eventOrElement instanceof HTMLElement) ||
      (typeof Element !== 'undefined' && eventOrElement instanceof Element)
    ) {
      componentProps.targetElement = eventOrElement as HTMLElement;
    }
    if (!componentProps.targetElement) throw new Error('No target element provided');

    const id = `${type}-${this.popovers.length + 1}-${uuid()}`;
    const popoverElement = <Component {...componentProps} key={id} id={id} type={type} />;
    this.popovers.push({
      id,
      element: popoverElement,
      options: options as unknown as IPopoverOptions<IAbstractPopoverProps>,
    });
    if (componentProps.focus) {
      this.focuses.push({ popoverId: id, targetRectangle: componentProps.targetElement.getBoundingClientRect() });
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
