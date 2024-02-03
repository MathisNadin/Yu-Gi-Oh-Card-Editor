// CustomEvent polyfill for ie11

export function install() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((typeof window !== 'undefined') && (typeof (window as any).CustomEvent !== "function")) {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let IE11CustomEvent = function(event: any, params: any) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };
      let evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    IE11CustomEvent.prototype = (window as any).Event.prototype;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).CustomEvent = IE11CustomEvent;
  }
}
