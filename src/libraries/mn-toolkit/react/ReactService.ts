import { createRoot } from "react-dom/client";

export class ReactService {
  private scrollbarSize!: number;

  public async renderContentInParent(divContent: JSX.Element, parent: Element): Promise<HTMLElement> {
    return new Promise(resolve => {
      // Rend le contenu JSX dans l'élément parent
      const root = createRoot(parent);
      root.render(divContent);

      // Utilise une micro-tâche pour s'assurer que le rendu est terminé
      queueMicrotask(() => {
        resolve(parent.lastChild as HTMLElement);
      });
    });
  }

  public createDivWithClass(className: string, parent: Element) {
    const div = document.createElement('div');
    div.className = className;
    parent.appendChild(div);
    return div;
  }

  public setStyle(element: HTMLElement, key: { [key: string]: string | boolean | number } | string, value?: string | boolean | number) {
    function convert(key: string, value: string | boolean | number) {
      if (typeof value === 'number' && ['width', 'height', 'left', 'top', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight'].includes(key)) {
        value = `${value}px`;
      } else {
        value = `${value}`;
      }
      return value;
    }
    if (typeof key === 'string') {
      element.style[key as any] = convert(key, value as string | number | boolean);
    } else {
      for (let k in key) {
        (element.style as any)[k] = convert(k, key[k]);
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

  public getScrollbarSize() {
    if (typeof this.scrollbarSize !== 'undefined') return this.scrollbarSize;
    /* istanbul ignore else */
    if (typeof document !== 'undefined') {
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
      this.scrollbarSize = div.offsetWidth - div.clientWidth - 1;
      document.body.removeChild(div);
    } else {
      this.scrollbarSize = 0;
    }
    return this.scrollbarSize ?? 0;
  }
}
