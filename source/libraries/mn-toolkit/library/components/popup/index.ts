import { AbstractPopup, IAbstractPopupProps } from './AbstractPopup';
import { PopupService } from './PopupService';

export * from './PopupService';
export * from './Popups';
export * from './AbstractPopup';
export * from './ConfirmationDialog';
export * from './PromptDialog';
export * from './InformDialog';
export * from './ChoiceDialog';
export * from './SortableDialog';

export interface IPopupListener {
  popupsChanged(): void;
}

export interface IPopupShowOptions<R, P extends IAbstractPopupProps<R>> {
  type: string;
  Component: new (...args: P[]) => AbstractPopup<R>;
  componentProps: P;
}

declare global {
  interface IApp {
    $popup: PopupService;
  }
}
