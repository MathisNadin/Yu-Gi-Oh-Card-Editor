// CustomEvent polyfill for IE11

declare global {
  interface Window {
    CustomEvent: {
      new <T = unknown>(type: string, eventInitDict?: CustomEventInit<T>): CustomEvent<T>;
      prototype: CustomEvent<unknown>;
    };
  }
}

export function install() {
  if (typeof window !== 'undefined' && typeof window.CustomEvent !== 'function') {
    const IE11CustomEvent = function <T = unknown>(event: string, params?: CustomEventInit<T>): CustomEvent<T> {
      const settings: CustomEventInit<T> = {
        bubbles: false,
        cancelable: false,
        detail: undefined,
        ...params,
      };

      const evt = document.createEvent('CustomEvent') as CustomEvent<T>;

      // eslint-disable-next-line @typescript-eslint/no-deprecated
      evt.initCustomEvent(event, settings.bubbles ?? false, settings.cancelable ?? false, settings.detail as T);

      return evt;
    };

    // Prototypage pour rester compatible avec le comportement natif
    IE11CustomEvent.prototype = window.Event.prototype as unknown as CustomEvent<unknown>;

    window.CustomEvent = IE11CustomEvent as typeof window.CustomEvent;
  }
}
