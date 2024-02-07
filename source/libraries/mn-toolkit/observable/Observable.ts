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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public askForResponse<R>(method: keyof T, ...args: any[]): R {
    for (let listener of this.listeners) {
      if (typeof listener[method] !== 'function') continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result = (listener[method] as any).apply(listener, args);
      if (!!result) return result as R;
    }
    return undefined as R;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async asyncDispatch(method: keyof T, ...args: any[]) {
    for (let listener of this.listeners) {
      if (typeof listener[method] !== 'function') continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (listener[method] as any).apply(listener, args);
    }
  }
}
