import { ReactElement } from 'react';
import { IActionsPopoverAction } from '../popover';
import { HeaderService } from './HeaderService';

export * from './AbstractView';
export * from './Breadcrumb';
export * from './HeaderSeparator';
export * from './HeaderService';
export * from './Header';
export * from './SubHeader';
export * from './Content';
export * from './Paper';
export * from './Footer';

export type TPartPosition = 'left' | 'center' | 'right';

export interface IHeaderComponent {
  component: ReactElement;
  weight?: number;
  position: TPartPosition;
}

export interface IHeaderCrumb {
  title: string;
  onTap?: () => void | Promise<void>;
}

export interface IHeaderListener {
  headerGetPageActions(actions: IActionsPopoverAction[]): void;
  headerGetButtons(buttons: IHeaderComponent[]): void;
  headerUpdated(): void;
  breadcrumbAlter(crumbs: IHeaderCrumb[]): void;
}

declare global {
  interface IApp {
    $header: HeaderService;
  }
}
