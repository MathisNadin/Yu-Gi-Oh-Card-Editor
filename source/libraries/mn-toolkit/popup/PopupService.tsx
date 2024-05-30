import { Observable, uuid } from 'mn-tools';
import { IAbstractPopupProps, IPopupListener, IPopupShowOptions } from '.';

export class PopupService extends Observable<IPopupListener> {
  public popups: JSX.Element[] = [];

  public async show<R, P extends IAbstractPopupProps<R>>(options: IPopupShowOptions<R, P>): Promise<R | undefined> {
    return new Promise<R | undefined>((resolve) => {
      const { Component, componentProps, type } = options;
      componentProps.height = componentProps.height || '80%';
      componentProps.width = componentProps.width || '80%';
      const key = `${type}-${this.popups.length + 1}-${uuid()}`;
      const popupElement = (
        <Component {...componentProps} onClose={(r) => resolve(r as R)} key={key} id={key} type={type} />
      );
      this.popups.push(popupElement);
      this.dispatch('popupsChanged');
    });
  }

  public remove(id: string) {
    this.popups = this.popups.filter((p) => p.props.id !== id);
    this.dispatch('popupsChanged');
  }

  public removeAll() {
    this.popups = [];
    this.dispatch('popupsChanged');
  }
}
