import { Drawer, IDrawerProps } from './Drawer';
import { DrawerService } from './DrawerService';

export * from './DrawerService';
export * from './Drawers';
export * from './Drawer';

export interface IDrawerListener {
  drawersChanged: () => void;
}

export interface IDrawerShowOptions<P extends IDrawerProps> {
  Component: new (...args: P[]) => Drawer;
  componentProps: P;
}

declare global {
  interface IApp {
    $drawer: DrawerService;
  }
}
