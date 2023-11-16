import './styles.scss';
import { isDefined, classNames, isNumber, isString } from 'libraries/mn-tools';
import { Component, ReactElement, ReactNode } from 'react';
import { themeSettings } from '../themeSettings';
import { ButtonLink } from '../button/ButtonLink';
import { IDeviceListener } from '../device';
import { Icon } from '../icon';
import { ButtonIcon } from '../button';
import { IPopoverAction, IPopoverOptions } from './interfaces';
import { PopoverContent } from './PopoverContent';

function popoverActionRenderer(
  action: IPopoverAction,
  onTapHandler: (event: React.MouseEvent, action: IPopoverAction) => void,
  last: boolean
) {

  if (action.separator) return <div className="separator"></div>;
  return <div
      className={classNames(
        {
          last,
          selected: action.selected,
          separator: action.separator,
          disabled: action.disabled,
          'title': action.isTitle,
          'sub-title': action.isSubTitle,
        },
        'action',
        !!action.color && `mn-color-${action.color}`)
      }
      onClick={event => !action.disabled && onTapHandler(event, action)}
    >

    {isDefined(action.icon) && <Icon color={action.iconColor} iconId={action.icon} />}

    <span className="text">{action.label}</span>

    {isDefined(action.badge) && <span className="mn-badge">{action.badge}</span>}

    {isDefined(action.button) && <ButtonIcon icon={action.button.icon} onTap={action.button.onTap} />}
  </div>;
}

export class PopoverService implements Partial<IDeviceListener> {
  private popupsContainer!: HTMLElement;
  private contentComponent!: Component<unknown, unknown> | Element;
  private options!: IPopoverOptions;
  private popovers: HTMLElement[];
  private search = '';
  private focusRect!: Element;
  private overlay!: Element;

  public constructor() {
    this.popovers = [];
    app.$device.addListener(this);
  }

  public deviceBackButton() {
    app.$errorManager.handlePromise(app.$popover.close());
  }

  /**
   * Affichage de la popover
   *
   * @Param options les options
   */
  public async show(zoptions: IPopoverOptions) {
    if (!this.popupsContainer) {
      this.popupsContainer = app.$react.createDivWithClass('mn-popups-container', document.body);
    }

    this.options = zoptions;

    if (this.options.event) this.options.event.stopPropagation();

    let targetRect!: DOMRect;
    if (!this.options.event || !this.options.targetElement || !this.options.targetRect) {
      targetRect = this.options.targetRect as DOMRect;
      if (!targetRect) {
        let targetElement = this.options.event ? this.options.event.currentTarget as HTMLElement : this.options.targetElement as HTMLElement;
        targetRect = targetElement.getBoundingClientRect();
      }
    }
    let targetEnlarge = isDefined(this.options.targetEnlarge) ? this.options.targetEnlarge : 8;
    if (targetRect && targetEnlarge) {
      targetRect = new DOMRect(
        targetRect.x - targetEnlarge / 2,
        targetRect.y - targetEnlarge / 2,
        targetRect.width + targetEnlarge,
        targetRect.height + targetEnlarge
      );
    }

    if (this.options.actions) {
      this.options.actions = this.options.actions.filter(x => !!x);
      this.options.maxVisibleItems = this.options.maxVisibleItems || 10;
      let nbVisibleSeparators = 0;
      let nbVisibleItems = 0;
      for (const action of this.options.actions) {
        if (action.separator) {
          nbVisibleSeparators++;
        } else {
          nbVisibleItems++;
        }
      }
      nbVisibleItems = this.options.maxVisibleItems > nbVisibleItems ? nbVisibleItems : this.options.maxVisibleItems;

      const themeDefaultItemHeight = themeSettings().themeDefaultItemHeight;
      const themeDefaultSpacing = themeSettings().themeDefaultSpacing;
      const separatorHeight = 1 + themeDefaultSpacing/2;
      const itemHeight = themeDefaultItemHeight + themeDefaultSpacing/2;
      this.options.height = nbVisibleItems*itemHeight + nbVisibleSeparators*separatorHeight + themeDefaultItemHeight/2 - themeDefaultSpacing;
    }

    this.options.doProcessAction = this.options.doProcessAction || (async (event: React.MouseEvent, action: IPopoverAction) => {
      await this.close();
      let promise = action.onTap ? action.onTap(event) : undefined;
      if (promise instanceof Promise) promise.catch((e: Error) => app.$errorManager.trigger(e));
    });
    this.options.actionRenderer = this.options.actionRenderer || popoverActionRenderer;

    this.options.scrollToItemIndex = this.options.scrollToItemIndex || 0;

    let classes = ['active', `mn-type-${this.options.type}`];

    let width = 300;
    if (this.options.width) width = this.options.width;
    if (this.options.syncWidth) width = targetRect.width;
    let cssHeight = this.options.height || 'fit-content';
    if (isDefined(this.options.maxHeight) && isNumber(cssHeight) && cssHeight > this.options.maxHeight) {
      cssHeight = this.options.maxHeight;
    }

    let popover = await app.$react.renderContentInParent(<div
      className={classNames('mn-popover', this.options.cssClass, {
        'mn-no-scroll': !!this.options.actions && this.options.actions.length <= (this.options.maxVisibleItems as number)
      })}
      tabIndex={this.options.dontManageFocus ? undefined : 100}
      onClick={event => event.stopPropagation()}
      onBlur={e => {
        if (this.options.dontManageFocus) return;
        setTimeout(() => app.$errorManager.handlePromise(this.close(e.target as HTMLElement)), 100);
      }}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (this.options.dontManageFocus) return;
        this.search += e.key;
        let match = this.options.actions.find(x => (x.label ?? '').toLowerCase().startsWith(this.search.toLowerCase()));
        if (!match) {
          this.search = e.key;
          match = this.options.actions.find(x => (x.label ?? '').toLowerCase().startsWith(this.search.toLowerCase()));
          if (!match) return;
        }
        let index = 0;
        if (match) index = this.options.actions.indexOf(match);
        if (index) setTimeout(() => (e.target as HTMLElement).scrollTo(0, index * themeSettings().themeDefaultItemHeight + themeSettings().themeDefaultBorderRadius));
      }}
      style={{
        top: -9999,
        left: -9999,
        width,
        height: cssHeight,
      }}>
      <div className='mn-popover-wrapper'>
        {!this.options.content ? <PopoverContent {...this.options} /> : this.options.content as ReactElement}
      </div>
      {!!this.options.buttons && <div className="buttons">
        {this.options.buttons.map(button => {
          return <ButtonLink label={button.label} onTap={() => {
            let promise = button.onTap ? button.onTap() : undefined;
            if (promise instanceof Promise) promise.catch((e: Error) => app.$errorManager.trigger(e));
          }} />;
        })}
      </div>}
    </div>, this.popupsContainer);
    this.popovers.push(popover);

    const height = popover.clientHeight + 2;

    if (this.options.overlay) {
      this.overlay = await app.$react.renderContentInParent(<div className='mn-popover-overlay' onClick={() => app.$errorManager.handlePromise(this.close())} />, this.popupsContainer);

      this.focusRect = await app.$react.renderContentInParent(<div className='mn-popover-focus'
        style={{
          left: targetRect.left,
          top: targetRect.top,
          width: targetRect.width,
          height: targetRect.height,
          position: 'absolute'
        }} />,
        this.popupsContainer);
    }

    let top: number;
    let left: number;
    if (this.options.type === 'bubble' || this.options.type === 'walktrough') {
      let direction: string;
      ({ top, left, direction } = this.calculateBubblePosition(targetRect, height, width));
      classes.push(`mn-${direction}`);
    } else {
      ({ top, left } = this.calculatePosition(popover, targetRect, height, width));
    }

    const padding = themeSettings().themeDefaultSpacing * 2;
    app.$react.setStyle(popover, {
      top: `${top}px`,
      left: `${left}px`,
      width: `${width - padding}px`,
      height: isString(cssHeight) ? cssHeight : `${cssHeight || height}px`,
    });
    popover.classList.add(...classes);

    setTimeout(() => {
      if (popover) {
        popover.scrollTo(0, (this.options.scrollToItemIndex as number) * 36);
        popover.focus();
      }
    });

    return popover;
  }

  /**
    * Cette fonction est utilisée pour calculer la position de la bulle en fonction de la hauteur et de la largeur de la bulle.
    * Elle renvoie un objet qui contient les propriétés 'top', 'left' et 'direction'.
    *
    * @param height la hauteur de la bulle
    * @param width la largeur de la bulle
    */
  private calculateBubblePosition(targetRect: DOMRect, height: number, width: number) {
    let screenWidth = app.$device.screenWidth;
    let screenHeight = app.$device.screenWidth;

    if (!targetRect) throw new Error('Pas implémenté');

    // Points possibles pour la position de la bulle
    let points = [
      { direction: 'bottom-top', weight: targetRect.top - height > 0 ? 4 : 1, top: targetRect.top, left: targetRect.left + targetRect.width / 2 },
      { direction: 'top-bottom', weight: targetRect.bottom + height < screenHeight ? 4 : 1, top: targetRect.bottom, left: targetRect.left + targetRect.width / 2 },
      { direction: 'right-left', weight: targetRect.left - width > 0 ? 4 : 1, top: targetRect.top + targetRect.height / 2, left: targetRect.left },
      { direction: 'left-right', weight: targetRect.right + width < screenWidth ? 4 : 1, top: targetRect.top + targetRect.height / 2, left: targetRect.right }
    ].filter(p => p.weight > 1);

    points.sort((a, b) => b.weight - a.weight);

    let point = points[0];

    // Coordonnées du triangle
    const triangle = { width: 15, height: 20 };
    const margin = 5;
    let { left, top } = point;
    let direction = point.direction;

    switch (direction) {
      case 'right-left':
        left -= width + triangle.width + margin;
        top -= height / 2;
        break;

      case 'left-right':
        left += triangle.width + margin;
        top -= height / 2;
        break;

      case 'top-bottom':
        left -= width / 2;
        top += triangle.height + margin;
        break;

      case 'bottom-top':
        left -= width / 2;
        top -= triangle.height + margin + height;
        break;

      default:
        break;
    }

    return { left, top, direction };
  }

  private calculatePosition(popover: HTMLElement, targetRect: DOMRect, height: number, width: number) {
    let screenWidth = app.$device.screenWidth;
    let screenHeight = app.$device.screenHeight;
    let left;
    let top;
    if (targetRect) {
      top = targetRect.top + targetRect.height;
      left = targetRect.left;

      if ((top + height) > screenHeight) {
        popover.classList.add('bottom');
        top -= height + targetRect.height;
      }
      if ((left + width) > screenWidth) {
        popover.classList.add('right');
        left -= width - targetRect.width;
      }
    } else {
      top = this.options.top as number;
      left = this.options.left as number;
      if ((left + width) > screenWidth) {
        popover.classList.add('right');
        left = screenWidth - width - 10;
      }
      if ((top + height) > screenHeight) {
        popover.classList.add('bottom');
        top = screenHeight - height - 10;
      }
    }
    // if (left < 0) left = 10;
    // if (top < 0) top = 10;
    // left -= 16;
    // top -= 16;
    return { top, left };
  }

  /**
   * Fermeture de la popover.
   *
   * @param lostFocus true if the closing implies a lost of focus.
   */
  public async close(popover?: HTMLElement) {
    if (!popover) popover = this.popovers.pop();
    if (!popover) return;

    popover.remove();
    popover = undefined;
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = undefined as unknown as Element;
    }
    if (this.focusRect) {
      this.focusRect.remove();
      this.focusRect = undefined as unknown as Element;
    }

    this.search = '';
  }

  public update() {
    (this.contentComponent as Component).forceUpdate();
  }

  public updateListActions(_actions: IPopoverAction[]) {
    if (this.visible) {
      (this.contentComponent as Component).forceUpdate();
    }
  }

  public get visible() {
    return !!document.querySelector('.mn-popover');
  }

}
