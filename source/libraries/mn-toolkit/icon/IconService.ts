import { AllHTMLAttributes, cloneElement } from 'react';
import { TIconId } from './Icon';

export class IconService {
  private _icons: { [key: string]: JSX.Element } = {};

  public register(name: TIconId, svg: JSX.Element) {
    this._icons[name] = svg;
  }

  public get(name: TIconId, props?: AllHTMLAttributes<HTMLElement>, ref?: React.RefObject<HTMLElement>) {
    try {
      const icon = this._icons[name];
      // Cloner l'élément JSX pour renvoyer une nouvelle instance
      return cloneElement(icon, { ...props, ref });
    } catch (e) {
      throw new Error(`Erreur au chargement de l'icône ${name}\n ${(e as Error).message}`);
    }
  }

  public get names() {
    return Object.keys(this._icons) as TIconId[];
  }
}
