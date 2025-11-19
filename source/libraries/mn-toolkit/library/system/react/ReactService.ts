import { JSX } from 'react';
import { createRoot } from 'react-dom/client';
import { isDefined } from 'mn-tools';

type TStyleValue = string | number | boolean;
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type TStyleKey = keyof CSSStyleDeclaration | string;
type TStyleObject = Partial<Record<TStyleKey, TStyleValue>>;

function convert(key: string, value: TStyleValue): string {
  if (
    typeof value === 'number' &&
    ['width', 'height', 'left', 'top', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight'].includes(key)
  ) {
    return `${value}px`;
  }
  return String(value);
}

export class ReactService {
  private _scrollbarSize?: number;

  public get scrollbarSize(): number {
    if (isDefined(this._scrollbarSize)) return this._scrollbarSize;

    if (isDefined(document)) {
      const div = document.createElement('div');
      this.setStyle(div, {
        width: 100,
        height: 100,
        position: 'absolute',
        top: -9999,
        overflow: 'scroll',
        MsOverflowStyle: 'scrollbar',
      });
      document.body.appendChild(div);
      this._scrollbarSize = div.offsetWidth - div.clientWidth - 1;
      document.body.removeChild(div);
    } else {
      this._scrollbarSize = 0;
    }
    return this._scrollbarSize ?? 0;
  }

  public async renderContentInParent(divContent: JSX.Element, parent: Element): Promise<ChildNode | null> {
    return new Promise((resolve) => {
      // Renders the JSX content in the parent element
      const root = createRoot(parent);
      root.render(divContent);

      // Uses a microtask to ensure rendering is complete
      setTimeout(() => {
        resolve(parent.lastChild);
      });
    });
  }

  public createDivWithClass(className: string, parent: Element) {
    const div = document.createElement('div');
    div.className = className;
    parent.appendChild(div);
    return div;
  }

  public setStyle(element: HTMLElement, key: TStyleObject | TStyleKey, value?: TStyleValue): void {
    const applyStyle = (prop: string, v: TStyleValue): void => {
      const cssValue = convert(prop, v);
      // pas de `any` ici, setProperty prend (string, string)
      element.style.setProperty(prop, cssValue);
    };

    if (typeof key === 'string') {
      if (value === undefined) return;
      applyStyle(key, value);
    } else {
      for (const [prop, v] of Object.entries(key)) {
        if (v === undefined) continue;
        applyStyle(prop, v as TStyleValue);
      }
    }
  }

  public getInnerWidth(element: HTMLElement) {
    const { clientWidth } = element;
    const { paddingLeft, paddingRight } = window.getComputedStyle(element);
    return clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight);
  }

  public getInnerHeight(element: HTMLElement) {
    const { clientHeight } = element;
    const { paddingTop, paddingBottom } = window.getComputedStyle(element);
    return clientHeight - parseFloat(paddingTop) - parseFloat(paddingBottom);
  }

  public domReady(fn: () => void) {
    if (document.readyState !== 'loading') {
      return fn();
    }

    if (document.addEventListener) {
      return document.addEventListener('DOMContentLoaded', fn);
    }

    if (document.attachEvent) {
      return document.attachEvent('onreadystatechange', () => {
        if (document.readyState !== 'loading') fn();
      });
    }

    return fn();
  }

  public async waitForTransition(element: Element) {
    return new Promise<void>((resolve) => {
      const process = () => {
        element.removeEventListener('transitionend', process);
        resolve();
      };
      element.addEventListener('transitionend', process);
    });
  }

  public async waitForAnimation(element: Element) {
    return new Promise<void>((resolve) => {
      const process = () => {
        element.removeEventListener('animationend', process);
        resolve();
      };
      element.addEventListener('animationend', process);
    });
  }
}
