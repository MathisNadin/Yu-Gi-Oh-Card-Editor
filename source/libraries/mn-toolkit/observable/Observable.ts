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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public dispatch(method: keyof T, ...args: any[]) {
    this.listeners.forEach(listener => {
      if (typeof listener[method] === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (listener[method] as any).apply(listener, args);
      }
    });
  }
}
