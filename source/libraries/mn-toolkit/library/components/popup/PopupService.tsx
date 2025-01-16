import { isString, Observable, uuid } from 'mn-tools';
import { TJSXElementChild } from '../../system';
import { IChoiceDialogProps, ChoiceDialog } from './ChoiceDialog';
import { IConfirmationDialogProps, ConfirmationDialog } from './ConfirmationDialog';
import { IInformDialogProps, InformDialog } from './InformDialog';
import { IPromptDialogProps, PromptDialog } from './PromptDialog';
import { AbstractPopup } from './AbstractPopup';
import { IAbstractPopupProps, IPopupListener, IPopupShowOptions } from '.';

export class PopupService extends Observable<IPopupListener> {
  public popups: { id: string; element: TJSXElementChild; ref: AbstractPopup<never> | null }[];

  public constructor() {
    super();
    this.popups = [];
    app.$device.addListener({
      deviceBackButton: () => app.$popup.removeLast(),
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

  public async show<R, P extends IAbstractPopupProps<R>>(options: IPopupShowOptions<R, P>): Promise<R | undefined> {
    return new Promise<R | undefined>((resolve) => {
      const { Component, componentProps, type } = options;
      const id = `${type}-${this.popups.length + 1}-${uuid()}`;
      let ref: AbstractPopup<R> | null = null;
      const popupElement = (
        <Component
          {...componentProps}
          ref={(instance) => {
            if (!instance) return;
            if (componentProps.onRef) componentProps.onRef(instance);
            ref = instance;
          }}
          onClose={(r) => resolve(r)}
          key={id}
          id={id}
          type={type}
        />
      );
      this.popups.push({ id, element: popupElement, ref });
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
}
