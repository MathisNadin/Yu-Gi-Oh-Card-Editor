import { IRouterHrefParams, TRouterState } from '../router';
import { TID } from '../application';
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
  selected?: boolean;
  onTap?: (event?: React.MouseEvent) => void;
  href?: IRouterHrefParams<T>;
  className?: string;
  height?: number;
  permission?: string;
  minHeight?: number;
  groupMinWidth?: number;
  below?: IMenuItem[];
}
