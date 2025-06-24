import { ReactElement } from 'react';
import { IRouterHrefParams, TRouterState } from '../../system';
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

export interface IHeaderCrumb<T extends TRouterState = TRouterState> {
  title: string;
  href?: IRouterHrefParams<T>;
}

export interface IHeaderListener {
  headerGetPageActions: (actions: IActionsPopoverAction[]) => void;
  headerGetButtons: (buttons: IHeaderComponent[]) => void;
  headerUpdated: () => void;
  breadcrumbAlter: (crumbs: IHeaderCrumb[]) => void;
}

declare global {
  interface IApp {
    $header: HeaderService;
  }
}
