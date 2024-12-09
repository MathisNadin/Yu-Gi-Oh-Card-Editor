/* eslint-disable @typescript-eslint/no-explicit-any */

// CustomEvent polyfill for ie11

declare global {
  interface Window {
    CustomEvent: {
      new <T = any>(type: string, eventInitDict?: CustomEventInit<T>): CustomEvent<T>;
      prototype: CustomEvent<any>;
    };
  }
}

export function install() {
  if (typeof window !== 'undefined' && typeof window.CustomEvent !== 'function') {
    const IE11CustomEvent = function (event: any, params: any) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };
      const evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };

    IE11CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = IE11CustomEvent as typeof window.CustomEvent;
  }
}
