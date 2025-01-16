import { AllHTMLAttributes, cloneElement } from 'react';
import { TIconId } from './Icon';

export class IconService {
  private _icons: { [key in TIconId]: JSX.Element } = {} as { [key in TIconId]: JSX.Element };

  public get icons() {
    return this._icons;
  }

  public register(name: TIconId, svg: JSX.Element) {
    this._icons[name] = svg;
  }

  public get(name: TIconId, props?: AllHTMLAttributes<HTMLElement>, ref?: React.RefObject<HTMLElement>) {
    try {
      const icon = this._icons[name];
      // Clone the JSX Element to return a new instance
      return cloneElement(icon, { ...props, ref });
    } catch (e) {
      throw new Error(`Erreur au chargement de l'icône ${name}\n ${(e as Error).message}`);
    }
  }

  public get names() {
    return Object.keys(this._icons) as TIconId[];
  }
}
