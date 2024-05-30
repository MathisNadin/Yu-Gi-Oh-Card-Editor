import { Observable, uuid } from 'mn-tools';
import { ActionsPopover, IActionsPopoverProps } from './ActionsPopover';
import { BubblePopover, IBubblePopoverProps } from './BubblePopover';
import { IPopoverListener, IPopoverOptions } from '.';
import { IAbstractPopoverProps } from './AbstractPopover';

export class PopoverService extends Observable<IPopoverListener> {
  public popovers: JSX.Element[] = [];

  public get visible() {
    return !!this.popovers.length;
  }

  public actions<ID = number>(event: React.MouseEvent, props: IActionsPopoverProps<ID>) {
    return this.show<IActionsPopoverProps<ID>>({
      event,
      type: 'actions',
      Component: ActionsPopover<ID>,
      componentProps: props,
    });
  }

  public bubble(event: React.MouseEvent, props: IBubblePopoverProps) {
    return this.show<IBubblePopoverProps>({
      event,
      type: 'bubble',
      Component: BubblePopover,
      componentProps: props,
    });
  }

  public show<P extends IAbstractPopoverProps>(options: IPopoverOptions<P>) {
    const { Component, componentProps, type } = options;
    if (!componentProps.targetRectangle) {
      const targetElement = options.event.target as HTMLElement;
      componentProps.targetRectangle = targetElement?.getBoundingClientRect();
    }
    const id = `${type}-${this.popovers.length + 1}-${uuid()}`;
    const popoverElement = <Component {...componentProps} key={id} id={id} type={type} />;
    this.popovers.push(popoverElement);
    this.dispatch('popoversChanged');
    return id;
  }

  public remove(id: string) {
    this.popovers = this.popovers.filter((p) => p.props.id !== id);
    this.dispatch('popoversChanged');
  }

  public removeAll() {
    this.popovers = [];
    this.dispatch('popoversChanged');
  }
}
