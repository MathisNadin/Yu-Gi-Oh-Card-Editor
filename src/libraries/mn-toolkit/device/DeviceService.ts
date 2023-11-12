/* eslint-disable no-console */
import { extend } from "libraries/mn-tools";
import { Observable } from "../observable/Observable";
import { IApplicationListener } from "../bootstrap";

export interface IScreenSpec {
  width?: number;
  height?: number;
  isSmallScreen?: boolean;
  isMediumScreen?: boolean;
  isLargeScreen?: boolean;
  isXLargeScreen?: boolean;
  isXXLargeScreen?: boolean;
  isPortrait?: boolean;
  isLandscape?: boolean;
}

export interface IDeviceListener {
  deviceScreenSpecificationChanged(newSpec: IScreenSpec): void;
  deviceForeground(): void;
  deviceBackground(): void;
  deviceOnline(): void;
  deviceOffline(): void;
  deviceBackButton(): void;
  deviceIdle(seconds: number): void;
  deviceInitialized(): void;
}

const IDLE_DELAY = 5;

export class DeviceService extends Observable<IDeviceListener> implements Partial<IApplicationListener> {
  private _idleCount!: number;
  private _idleTimerId!: NodeJS.Timeout;
  private _timeOffset!: number;
  // private _language!: LanguageLocale;
  private _screenSpec!: IScreenSpec;
  private _platform!: string;
  private _foreground = false;

  public fireScreenSpecChanged(spec: IScreenSpec) { this.dispatch('deviceScreenSpecificationChanged', spec); }
  public fireOnline() { this.dispatch('deviceOnline'); }
  public fireOffline() { this.dispatch('deviceOffline'); }
  public fireBackground() { this.dispatch('deviceBackground'); }
  public fireForeground() { this.dispatch('deviceForeground'); }

  public constructor() {
    super();
    this.fireScreenSpecChanged(this.screenSpec);
    document.addEventListener("backbutton", (event: Event) => {
      event.preventDefault();
      this.dispatch('deviceBackButton');
    }, false);
    app.addListener(this);
  }

  public getSpec() {
    let deviceRecord: {
      device: {
        id: string,
        native: boolean,
        platform: string,
        model: string,
        version: string,
        language: string,
        time: Date,
        timeOffset: number
        screen: {
          width: number,
          height: number,
          pixelWidth: number,
        },
      },
      client: {
        // language: LanguageLocale
        name: string,
        stage: string,
        version: string
        userAgent: string,
      }
    } = {
      device: {
        id: undefined as unknown as string,
        native: false,
        platform: undefined as unknown as string,
        model: undefined as unknown as string,
        version: undefined as unknown as string,
        // language: app.$device.language,
        language: 'fr',
        time: new Date(),
        timeOffset: app.$device.timeOffset,
        screen: {
          width: app.$device.screenWidth,
          height: app.$device.screenHeight,
          pixelWidth: window.devicePixelRatio || 1,
        },
      },
      client: {
        name: app.name,
        version: app.version,
        stage: app.stage,
        // language: app.$i18n.currentLanguage,
        userAgent: navigator.userAgent,
      }
    };

    /* if (hasCordova()) {
      deviceRecord.device.native = true;
      deviceRecord.device.model = window.device.model;
      deviceRecord.device.platform = window.device.platform;
      deviceRecord.device.version = window.device.version;
      deviceRecord.device.id = window.device.uuid;
    } */
    return deviceRecord;
  }


  public applicationReady() {
    // console.log('READY');
    this.setupBackground();
    this.startIdle();
  }

  public get screenSpec() {
    return this._screenSpec;
  }

  /**
   * Configuration du service
   *
   * @memberOf $device
   */
  public async setup() {
    await this.setupDevice();
    this.setupScreen();
    // this.setupStatusBar();
    this.setupNetwork();
    this.setupGlobalization();
    // console.log("hybrid", this.isNative);
    this.dispatch('deviceInitialized');
    return Promise.resolve();
  }

  private setupGlobalization() {
    /* if (!this._language && typeof navigator.language !== undefined) {
      // console.log('language', 'using navigator.language', navigator.language);
      this._language = navigator.language.toLowerCase().replace('-', '_') as LanguageLocale;
    }
    if (!this._language && typeof navigator.languages !== undefined) {
      // console.log('language', 'using navigator.languages', navigator.languages);
      for (let language of navigator.languages) {
        if (language.length > 2) {
          this._language = language.toLowerCase().replace('-', '_') as LanguageLocale;
          break;
        }
      }
    }

    this._language = i18n.normalizeLanguage(this._language); */
    this._timeOffset = new Date().getTimezoneOffset();
  }


  /**
   * Initialisation de device. Principalement on
   * attend cordova
   *
   * @memberOf $device
   */
  private async setupDevice() {
    if (this.isNative) {
      /* this._platform = window.device.platform.toLowerCase();
      // console.log('deviceId', this._platform);
      document.body.classList.add('an-platform-mobile'); */
    } else {
      this._platform = 'web';
      // console.log('deviceId', this._platform);
    }
    document.body.classList.add(`an-platform-${this._platform}`);
    return Promise.resolve();
  }


  private onScreenSpecChanged(data: boolean | IScreenSpec = false) {
    // console.log('onScreenSpecChanged');
    let smallBreakpoint = 576;
    let mediumBreakpoint = 768;
    let largeBreakpoint = 992;
    let xlargeBreakpoint = 1200;
    let xxlargeBreakpoint = 1600;

    // let width = domViewportWidth();
    // let height = domViewportHeight();
    let width = window.innerWidth;
    let height = window.innerHeight;
    let isPortrait = width < height;
    this._screenSpec = extend(this._screenSpec, {
      width,
      height,
      isSmallScreen: width <= smallBreakpoint,
      isMediumScreen: width > smallBreakpoint && width < mediumBreakpoint,
      isLargeScreen: width > mediumBreakpoint && width < largeBreakpoint,
      isXLargeScreen: width > largeBreakpoint && width < xlargeBreakpoint,
      isXXLargeScreen: width > xlargeBreakpoint,
      isPortrait,
      isLandscape: !isPortrait
    });
    document.body.classList.remove('an-screen-small', 'an-screen-medium', 'an-screen-large', 'an-screen-xlarge', 'an-screen-xxlarge');
    if (width > mediumBreakpoint) document.body.classList.add('an-screen-medium');
    if (width > largeBreakpoint) document.body.classList.add('an-screen-large');
    if (width > xlargeBreakpoint) document.body.classList.add('an-screen-xlarge');
    if (width > xxlargeBreakpoint) document.body.classList.add('an-screen-xxlarge');

    if (typeof data !== 'boolean') {
      extend(this._screenSpec, data);
    }
    // console.log('spec updated', this._screenSpec);
    this.fireScreenSpecChanged(this._screenSpec);
  }

  /* public keyboardClose() {
    if (this.isNative) Keyboard.hide();
  }

  public keyboardOpen() {
    if (this.isNative) Keyboard.show();
  } */


  private setupScreen() {
    window.addEventListener('resize', () => this.onScreenSpecChanged(), true);
    this.onScreenSpecChanged();
  }


  public get screenWidth() { return this._screenSpec.width as number; }
  public get screenHeight() { return this._screenSpec.height as number; }
  public get isPortrait() { return this._screenSpec.isPortrait; }
  public get isLandscape() { return this._screenSpec.isLandscape; }
  public get isSmallScreen() { return this._screenSpec.isSmallScreen; }
  public get isMediumScreen() { return this._screenSpec.isMediumScreen; }
  public get isLargeScreen() { return this._screenSpec.isLargeScreen; }


  /**
   * Initialisation de la barre de statut
   *
   * @memberOf $device
   */
  /* private setupStatusBar() {
    if (!this.isNative) return;
    if (!!StatusBar) {
      window.StatusBar.styleDefault();
    } else {
      log.warning('Pas de status bar ???');
    }
  } */

  private doResume() {
    this.restartIdle();
    this._foreground = true;
    // console.log('Device foreground');
    this.fireForeground();
  }


  private doPause() {
    this.stopIdle();
    this._foreground = false;
    this.fireBackground();
  }


  private setupBackground() {
    if (this.isNative) {
      document.addEventListener(this.isApple ? "resign" : "pause", () => { this.doPause(); }, false);
      document.addEventListener("resume", () => { this.doResume(); }, false);
    } else {
      let hidden: string;
      let visibilityChange!: string;
      if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
        hidden = "hidden";
        visibilityChange = "visibilitychange";
      } else if (typeof (document as any).mozHidden !== "undefined") {
        hidden = "mozHidden";
        visibilityChange = "mozvisibilitychange";
      } else if (typeof (document as any).msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
      } else if (typeof (document as any).webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
      }

      document.addEventListener(visibilityChange, () => {
        if ((document as any)[hidden]) {
          // console.log('App invisible');
          this.doPause();
        } else {
          // console.log('App visible');
          this.doResume();
        }
      }, false);

      window.addEventListener('pagehide', function () {
        // console.log('Page hidden');
        app.$device.doPause();
      });
      window.addEventListener('blur', function () {
        // console.log('Page blur');
        app.$device.doPause();
      });
    }
    this.doResume();
  }

  private rearmIdleTimer() {
    this._idleTimerId = setTimeout(() => this.onIdle(), IDLE_DELAY * 1000);
  }

  private onIdle() {
    this._idleCount++;
    let time = IDLE_DELAY * this._idleCount;
    // console.log('idle', time, 's');
    this.dispatch('deviceIdle', time);
    this.rearmIdleTimer();
  }

  public restartIdle() {
    // console.log('idle', 'restart');
    this.stopIdle();
    this._idleCount = 0;
    this.rearmIdleTimer();
  }

  private stopIdle() {
    clearTimeout(this._idleTimerId);
  }

  private startIdle() {
    ['touchend', 'mousedown', 'keypress', 'touchmove'].forEach(eventName => {
      document.addEventListener(eventName, () => this.restartIdle(), false);
    });
    this.restartIdle();
  }

  private setupNetwork() {
    window.addEventListener("offline", () => {
      // console.log('offline', this.isConnected());
      this.fireOffline();
    }, false);
    window.addEventListener("online", () => {
      // console.log('online', this.isConnected());
      this.fireOnline();
    }, false);
  }


  public isConnected() {
    return navigator.onLine;
  }


  // public get isNative() { return !!window.cordova; }
  public get isNative() { return false; }
  public get isBackground() { return !this._foreground; }
  public get isTouch() { return !!("ontouchstart" in window || (navigator as any).msMaxTouchPoints); }
  public get isAndroid() { return this._platform === 'android'; }
  public get isApple() { return this._platform === 'ios'; }
  public get isWeb() { return this._platform === 'web'; }
  public get platform() { return this._platform; }
  // public get language(): LanguageLocale { return this._language; }
  public get timeOffset(): number { return this._timeOffset; }

  /* public hideSplash() {
    if (this.isNative) navigator.splashscreen.hide();
  } */


  public get isIE() {
    let ua = navigator.userAgent;
    return ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
  }

  public get isChrome() {
    let isChromium = (window as any).chrome;
    let winNav = window.navigator;
    let vendorName = winNav.vendor;
    let isOpera = typeof (window as any).opr !== "undefined";
    let isIEedge = winNav.userAgent.indexOf("Edge") > -1;
    let isIOSChrome = /CriOS/.exec(winNav.userAgent);

    if (isIOSChrome) {
      return false;
    } else if (
      isChromium !== null &&
      typeof isChromium !== "undefined" &&
      vendorName === "Google Inc." &&
      isOpera === false &&
      isIEedge === false
    ) {
      return true;
    } else {
      return false;
    }
  }
}
