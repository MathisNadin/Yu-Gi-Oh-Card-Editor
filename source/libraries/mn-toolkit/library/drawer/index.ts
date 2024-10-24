export * from './DrawerService';
export * from './LeftDrawer';
export * from './RightDrawer';

export interface IDrawerListener {
  paneClose(pane: IDrawer): void;
  paneOpen(pane: IDrawer): void;
}

export interface IDrawer {
  toggle(): void;
  retract(): void;
  isActive: boolean;
}

export interface IDrawerProps extends PropsWithChildren {
  className?: string;
  overlay?: boolean;
  closeWithOverlay?: boolean;
  closeOnClick?: boolean;
  handleSize?: number;
  handleLabel?: string;
  smallDeviceWidth: string;
  mediumDeviceWidth: string;
  expanded?: boolean;
  onTap?: (pane: IDrawer) => void;
}

import { PropsWithChildren } from 'react';
import { DrawerService } from './DrawerService';

declare global {
  interface IApp {
    $drawer: DrawerService;
  }
}
