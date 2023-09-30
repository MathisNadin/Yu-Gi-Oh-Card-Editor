// CustomEvent polyfill for ie11

export function install() {
  if ((typeof window !== 'undefined') && (typeof (window as any).CustomEvent !== "function")) {

    let IE11CustomEvent = function(event: any, params: any) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };
      let evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };

    IE11CustomEvent.prototype = (window as any).Event.prototype;

    (window as any).CustomEvent = IE11CustomEvent;
  }
}
