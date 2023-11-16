import { CSSProperties } from "react";
import { createRoot } from "react-dom/client";

export class ReactService {

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

  public setStyle(element: HTMLElement, styles: CSSProperties) {
    for (const property in styles) {
      const value = styles[property as keyof CSSProperties];
      // Convertit la propriété en format camelCase si nécessaire
      const cssProperty = property.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
      element.style.setProperty(cssProperty, value as string);
    }
  }
}
