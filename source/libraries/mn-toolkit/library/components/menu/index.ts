import { isNumber } from 'mn-tools';
import { IRouterHrefParams, TRouterState, TID, TRouterParams } from '../../system';
import { TIconId } from '../icon';

export * from './TopMenu';
export * from './LeftMenu';
export * from './MenuPane';

export interface IMenuItem<T extends TRouterState = TRouterState> {
  id?: TID;
  label?: string;
  icon?: TIconId;
  iconColor?: string;
  badge?: string | number;
  collapsable?: boolean;
  onTap?: (event: React.MouseEvent<HTMLDivElement | HTMLLIElement>) => void;
  href?: string | IRouterHrefParams<T>;
  className?: string;
  height?: number;
  permission?: string;
  minHeight?: number;
  groupMinWidth?: number;
  below?: IMenuItem[];
}

function isSameParameters<T extends TRouterState = TRouterState>(params?: TRouterParams<T>) {
  if (!app.$router.currentState) return true;

  params = params || ({} as TRouterParams<T>);
  for (const record of app.$router.currentState.pathKeys) {
    const k = record.name as keyof TRouterParams<T>;
    const routerParameters = app.$router.getParameters<T>();
    const routerParam = isNumber(routerParameters[k]) ? `${routerParameters[k]}` : routerParameters[k];
    const param = isNumber(params[k]) ? `${params[k]}` : params[k];

    // To avoir incorrect comparison between number and string
    if (routerParam !== param) return false;
  }
  return true;
}

function hasSameState(item: IMenuItem) {
  const currentState = app.$router.currentState;

  if (!currentState || !item.href) {
    return false;
  }

  // Check if href is an object with state and params properties
  if (typeof item.href === 'object' && 'state' in item.href && 'params' in item.href) {
    return item.href.state === currentState.name && isSameParameters(item.href.params);
  }

  // If href is a string, it cannot have the same state as currentState
  return false;
}

export function isMenuItemActive(item: IMenuItem) {
  return !!item.href && hasSameState(item);
}
