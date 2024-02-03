import { ReactElement } from "react";
import { TIconId } from "../icon";
import { TForegroundColor } from "../themeSettings";

export interface IPopoverButton<ID = number> {
  id?: ID;
  label?: string;
  icon?: TIconId;
  onTap?: (event?: Event) => void | Promise<void>;
}

export interface IPopoverAction<ID = number> {
  label?: string;
  onTap?: (event: React.MouseEvent) => void | Promise<void>;
  color?: TForegroundColor;
  icon?: TIconId;
  iconColor?: TForegroundColor;
  id?: ID;
  badge?: string | number;
  separator?: boolean;
  disabled?: boolean;
  isTitle?: boolean;
  isSubTitle?: boolean;
  selected?: boolean;
  button?: {
    icon: TIconId;
    onTap: () => void | Promise<void>;
  }
}

export interface IPopoverOptions {
  targetEnlarge?: number;
  overlay?: boolean;
  event?: React.MouseEvent;
  minWidth?: number;
  width?: number;
  minHeight?: number;
  height?: number;
  maxHeight?: number;
  top?: number;
  left?: number;
  type?: 'normal' | 'bubble' | 'walktrough';
  cssClass?: string;
  dontManageFocus?: boolean;
  scrollToItemIndex?: number;
  maxVisibleItems?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actions: IPopoverAction<any>[];
  buttons?: IPopoverButton[];
  doProcessAction?: (event: React.MouseEvent, action: IPopoverAction) => void | Promise<void>;
  targetElement?: HTMLElement;
  content?: ReactElement;
  targetRect?: DOMRect;
  syncWidth?: boolean;
  actionRenderer?: (
    action: IPopoverAction,
    handler: (event: React.MouseEvent, action: IPopoverAction) => void,
    last: boolean) => JSX.Element;
}
