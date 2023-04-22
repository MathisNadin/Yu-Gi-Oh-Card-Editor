/* eslint-disable prettier/prettier */
/* eslint-disable lines-between-class-members */
/* eslint-disable import/prefer-default-export */

export class Observable<T> {
  private listeners: Partial<T>[] = [];

  public addListener(listener: Partial<T>) {
    this.listeners.push(listener);
    return listener;
  }

  public removeListener(listener: Partial<T>) {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) this.listeners.splice(index, 1);
  }

  public dispatch(method: keyof T, ...args: any[]) {
    this.listeners.forEach(listener => {
      if (typeof listener[method] === 'function') {
        (listener[method] as any).apply(listener, args);
      }
    });
  }
}
