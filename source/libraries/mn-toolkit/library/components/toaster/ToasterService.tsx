import { JSX } from 'react';
import { AbstractObservable, uuid } from 'mn-tools';
import { IToasterListener, Toaster, TToastType } from '.';

export class ToasterService extends AbstractObservable<IToasterListener> {
  public toasters: JSX.Element[] = [];

  public info(message: string) {
    this.show(message, 'info');
  }

  public success(message: string) {
    this.show(message, 'success');
  }

  public warning(message: string) {
    this.show(message, 'warning');
  }

  public error(message: string) {
    this.show(message, 'error');
  }

  public show(message: string, type: TToastType) {
    const key = `${type}-${this.toasters.length + 1}-${uuid()}`;
    const toasterElement = <Toaster key={key} id={key} message={message} type={type} />;
    this.toasters.push(toasterElement);
    this.dispatch('toastersChanged');
  }

  public remove(id: string) {
    this.toasters = this.toasters.filter((p) => p.props.id !== id);
    this.dispatch('toastersChanged');
  }

  public removeLast() {
    this.toasters.pop();
    this.dispatch('toastersChanged');
  }

  public removeAll() {
    this.toasters = [];
    this.dispatch('toastersChanged');
  }
}
