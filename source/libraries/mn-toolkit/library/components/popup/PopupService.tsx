import { isString, AbstractObservable, uuid } from 'mn-tools';
import { TJSXElementChild } from '../../system';
import { IChoiceDialogProps, ChoiceDialog } from './ChoiceDialog';
import { IConfirmationDialogProps, ConfirmationDialog } from './ConfirmationDialog';
import { IInformDialogProps, InformDialog } from './InformDialog';
import { IPromptDialogProps, PromptDialog } from './PromptDialog';
import { ISortableDialogProps, SortableDialog } from './SortableDialog';
import { AbstractPopup } from './AbstractPopup';
import { IAbstractPopupProps, IPopupListener, IPopupShowOptions } from '.';

interface IPopupData {
  id: string;
  element: TJSXElementChild;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: AbstractPopup<any> | null;
}

export class PopupService extends AbstractObservable<IPopupListener> {
  public popups: IPopupData[];

  public constructor() {
    super();
    this.popups = [];
    app.$device.addListener({
      deviceBackButton: () => app.$popup.closeLast(),
    });
    app.$router.addListener({
      routerStateChanged: () => app.$popup.closeAll(),
    });
  }

  public async confirm(options: string | IConfirmationDialogProps) {
    let props: IConfirmationDialogProps;
    if (isString(options)) {
      props = { message: options };
    } else {
      props = options;
    }
    props.width = props.width || (app.$device.isSmallScreen ? '90%' : '50%');
    return await this.show({
      type: 'confirmation',
      Component: ConfirmationDialog,
      componentProps: props,
    });
  }

  public async inform(options: string | IInformDialogProps) {
    let props: IInformDialogProps;
    if (isString(options)) {
      props = { message: options };
    } else {
      props = options;
    }
    props.width = props.width || (app.$device.isSmallScreen ? '90%' : '50%');
    return await this.show({
      type: 'inform',
      Component: InformDialog,
      componentProps: props,
    });
  }

  public async prompt(options: string | IPromptDialogProps) {
    let props: IPromptDialogProps;
    if (isString(options)) {
      props = { label: options };
    } else {
      props = options;
    }
    props.width = props.width || (app.$device.isSmallScreen ? '90%' : '50%');
    return await this.show({
      type: 'prompt',
      Component: PromptDialog,
      componentProps: props,
    });
  }

  public async choice<ID = string>(options: IChoiceDialogProps<ID>) {
    options.width = options.width || (app.$device.isSmallScreen ? '90%' : '50%');
    return await this.show({
      type: 'choice',
      Component: ChoiceDialog<ID>,
      componentProps: options,
    });
  }

  public async sortable<ID = string>(options: ISortableDialogProps<ID>) {
    options.width = options.width || (app.$device.isSmallScreen ? '90%' : '50%');
    return await this.show({
      type: 'sortable',
      Component: SortableDialog<ID>,
      componentProps: options,
    });
  }

  public async show<R, P extends IAbstractPopupProps<R>>(options: IPopupShowOptions<R, P>): Promise<R | undefined> {
    return new Promise<R | undefined>((resolve) => {
      const { Component, componentProps, type } = options;
      const id = `${type}-${this.popups.length + 1}-${uuid()}`;
      const popup: IPopupData = { id, element: null, ref: null };
      popup.element = (
        <Component
          {...componentProps}
          ref={(instance) => {
            if (!instance) return;
            if (componentProps.onRef) componentProps.onRef(instance);
            popup.ref = instance;
          }}
          onClose={(r) => resolve(r)}
          key={id}
          id={id}
          type={type}
        />
      );
      this.popups.push(popup);
      this.dispatch('popupsChanged');
    });
  }

  public remove(id: string) {
    this.popups = this.popups.filter((p) => p.id !== id);
    this.dispatch('popupsChanged');
  }

  public removeLast() {
    this.popups.pop();
    this.dispatch('popupsChanged');
  }

  public removeAll() {
    this.popups = [];
    this.dispatch('popupsChanged');
  }

  public async close(id: string) {
    if (!this.popups.length) return;
    const popup = this.popups.find((p) => p.id === id);
    if (!popup) return;

    if (popup?.ref && typeof popup.ref.close === 'function') {
      await popup.ref.close();
    } else {
      this.remove(id);
    }
  }

  public async closeLast() {
    if (!this.popups.length) return;
    const lastPopup = this.popups[this.popups.length - 1];
    if (lastPopup?.ref && typeof lastPopup.ref.close === 'function') {
      await lastPopup.ref.close();
    } else {
      this.removeLast();
    }
  }

  public async closeAll() {
    while (this.popups.length) {
      await this.closeLast();
    }
  }
}
