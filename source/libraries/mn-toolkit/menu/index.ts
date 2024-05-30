import { TID } from '../application';
import { TIconId } from '../icon';

export * from './TopMenu';
export * from './LeftMenu';
export * from './MenuPane';

export interface IMenuItem {
  id?: TID;
  label?: string;
  icon?: TIconId;
  iconColor?: string;
  badge?: string | number;
  collapsable?: boolean;
  selected?: boolean;
  onTap?: (event?: React.MouseEvent) => void;
  state?: keyof IRouter;
  stateParameters?: object;
  defaultState?: string;
  defaultStateParameters?: object;
  height?: number;
  permission?: string;
  className?: string;
  minHeight?: number;
  groupMinWidth?: number;
  below?: IMenuItem[];
}
