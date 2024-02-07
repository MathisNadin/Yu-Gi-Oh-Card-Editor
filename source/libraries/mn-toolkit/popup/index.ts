import { Component } from 'react';
import { TIconId } from '../icon';
import { PopupService } from './PopupService';
import { IPopupProps } from './Popup';
import { TID } from '../application';

export * from './PopupService';
export * from './Popup';

declare global {
  interface IApp {
    $popup: PopupService;
  }
}

export interface IPopupAskOptions {
  message: string;
  title?: string;
  height?: number;
  icon?: TIconId;
}

export interface IPopupButton {
  hidden?: boolean;
  id?: TID;
  label?: string;
  iconColor?: string;
  badge?: string | number;
  selected?: boolean;
  onTap?: (event?: Event) => void | Promise<void>;
  validate?: boolean,
  cancel?: boolean,
  type?: string;
  disabled?: boolean;
  dangerous?: boolean;
  icon?: string;
}

export interface IPopup<RESULT = void> {
  overlay: HTMLElement;
  frame: HTMLElement;
  options: IPopupProps;
  close: (result?: RESULT) => void;
  addButtons: (...buttons: IPopupButton[]) => void;
}

export abstract class AbstractPopupComponent<Props, State, RESULT = void>
  extends Component<Props, State> {
  protected popup!: IPopup<RESULT>;
  public abstract onInitializePopup(popup: IPopup<RESULT>, props: Props): void;
  public onDestroyPopup(): void {}
}
