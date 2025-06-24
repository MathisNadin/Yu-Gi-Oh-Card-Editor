import { Capacitor as CapacitorCore } from '@capacitor/core';
import { Network as CapacitorNetwork } from '@capacitor/network';
import { Device as CapacitorDevice } from '@capacitor/device';
import { Keyboard as CapacitorKeyboard } from '@capacitor/keyboard';
import { SplashScreen as CapacitorSplashScreen } from '@capacitor/splash-screen';
import { StatusBar as CapacitorStatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import {
  extend,
  isBoolean,
  isDefined,
  isString,
  TLanguageLocale,
  logger,
  AbstractObservable,
  serialize,
} from 'mn-tools';
import { IDeviceSpec } from 'api/main';
import { IApplicationListener } from '../../system';

export interface IScreenSpec {
  width: number;
  height: number;
  screenSize: TScreenSize;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  isXLargeScreen: boolean;
  isXXLargeScreen: boolean;
  isXXXLargeScreen: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
}

export type TScreenSize = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'xxxlarge';

export interface IDeviceListener {
  deviceScreenSpecificationChanged: (newSpec: IScreenSpec, oldSpec: IScreenSpec, screenSizeChanged: boolean) => void;
  deviceForeground: () => void | Promise<void>;
  deviceBackground: () => void | Promise<void>;
  deviceOnline: () => void | Promise<void>;
  deviceOffline: () => void | Promise<void>;
  deviceBackButton: () => void | Promise<void>;
  deviceIdle: (seconds: number) => void | Promise<void>;
  deviceInitialized: () => void | Promise<void>;
}

const log = logger('device');

const IDLE_DELAY = 5;

export class DeviceService extends AbstractObservable<IDeviceListener> implements Partial<IApplicationListener> {
  private _idleCount!: number;
  private _idleTimerId!: NodeJS.Timeout;
  private _timeOffset!: number;
  private _language!: TLanguageLocale;
  private _screenSpec!: IScreenSpec;
  private _platform!: string;
  private _foreground = false;
  private _isConnected = false;
  private _hasWebkit = false;

  private _screenClasses: Record<TScreenSize, string> = {
    small: 'mn-screen-small',
    medium: 'mn-screen-medium',
    large: 'mn-screen-large',
    xlarge: 'mn-screen-xlarge',
    xxlarge: 'mn-screen-xxlarge',
    xxxlarge: 'mn-screen-xxxlarge',
  };

  public constructor() {
    super();
    document.addEventListener(
      'backbutton',
      (event: Event) => {
        event.preventDefault();
        app.$errorManager.handlePromise(this.dispatchAsync('deviceBackButton'));
      },
      false
    );
    app.addListener(this);
  }

  public async getSpec() {
    const deviceRecord: IDeviceSpec = {
      device: {
        id: undefined!,
        native: false,
        platform: undefined!,
        model: undefined!,
        version: undefined!,
        language: this.language,
        time: new Date(),
        timeOffset: this.timeOffset,
        screen: {
          width: this.screenWidth!,
          height: this.screenHeight!,
          pixelWidth: window.devicePixelRatio || 1,
        },
      },
      client: {
        name: app.name,
        version: app.version,
        stage: app.stage,
        userAgent: navigator.userAgent,
        language: 'fr_fr', // app.$i18n.currentLanguage,
      },
    };

    if (this.isCapacitor) {
      const info = await CapacitorDevice.getInfo();
      const id = await CapacitorDevice.getId();
      deviceRecord.device.native = true;
      deviceRecord.device.model = info.model;
      deviceRecord.device.platform = info.platform;
      deviceRecord.device.version = info.osVersion;
      deviceRecord.device.id = id.identifier;
    }
    return deviceRecord;
  }

  public applicationReady() {
    log.debug('READY');
    this.setupBackground();
    this.startIdle();
  }

  public async setup() {
    this.setupDevice();
    this.setupScreen();
    await this.setupStatusBar();
    await this.setupNetwork();
    this.setupGlobalization();
    log.debug('hybrid', this.isNative);
    await this.dispatchAsync('deviceInitialized');
  }

  private setupGlobalization() {
    /* if (!this._language && typeof navigator.language !== undefined) {
      log.debug('language', 'using navigator.language', navigator.language);
      this._language = navigator.language.toLowerCase().replace('-', '_') as TLanguageLocale;
    }
    if (!this._language && typeof navigator.languages !== undefined) {
      log.debug('language', 'using navigator.languages', navigator.languages);
      for (let language of navigator.languages) {
        if (language.length > 2) {
          this._language = language.toLowerCase().replace('-', '_') as TLanguageLocale;
          break;
        }
      }
    }

    this._language = i18n.normalizeLanguage(this._language); */
    this._language = 'fr_fr';
    this._timeOffset = new Date().getTimezoneOffset();
  }

  private setupDevice() {
    if (this.isCapacitor) {
      this._platform = CapacitorCore.getPlatform().toLowerCase();
      log.debug('deviceId', this._platform);
    } else if (this.isElectron(window)) {
      this._platform = 'desktop';
    } else {
      this._platform = 'web';
    }
    log.debug('deviceId', this._platform);
    document.body.classList.add(`mn-platform-${this._platform}`);

    if (this.isMobile) {
      document.body.classList.add('mn-platform-mobile');
    } else if (this.isDesktop) {
      document.body.classList.add('mn-platform-desktop');
    } else if (this.isWeb) {
      document.body.classList.add('mn-platform-web');
    }

    this._hasWebkit = /webkit/i.test(navigator.userAgent) && !/edge/i.test(navigator.userAgent);
    if (this._hasWebkit) {
      document.body.classList.add('with-webkit');
    } else {
      document.body.classList.add('without-webkit');
    }
  }

  /** Breakpoints used to separate standard device sizes:
   * - smallBreakpoint (480px): mobile devices
   * - mediumBreakpoint (768px): tablets in portrait mode
   * - largeBreakpoint (1024px): tablets in landscape mode and small laptops
   * - xlargeBreakpoint (1280px): typical laptops and mid-sized desktops
   * - xxlargeBreakpoint (1536px): large desktops and high-resolution screens
   */
  private onScreenSpecChanged(data: boolean | IScreenSpec = false) {
    log.debug('onScreenSpecChanged');
    const oldSpec = { ...this._screenSpec };

    const smallBreakpoint = 480;
    const mediumBreakpoint = 768;
    const largeBreakpoint = 1024;
    const xlargeBreakpoint = 1280;
    const xxlargeBreakpoint = 1536;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = width < height;
    this._screenSpec = extend(this._screenSpec, {
      width,
      height,
      isSmallScreen: width < smallBreakpoint,
      isMediumScreen: width >= smallBreakpoint && width < mediumBreakpoint,
      isLargeScreen: width >= mediumBreakpoint && width < largeBreakpoint,
      isXLargeScreen: width >= largeBreakpoint && width < xlargeBreakpoint,
      isXXLargeScreen: width >= xlargeBreakpoint && width < xxlargeBreakpoint,
      isXXXLargeScreen: width >= xxlargeBreakpoint,
      isPortrait,
      isLandscape: !isPortrait,
    });

    if (this._screenSpec.isSmallScreen) {
      this._screenSpec.screenSize = 'small';
    } else if (this._screenSpec.isMediumScreen) {
      this._screenSpec.screenSize = 'medium';
    } else if (this._screenSpec.isLargeScreen) {
      this._screenSpec.screenSize = 'large';
    } else if (this._screenSpec.isXLargeScreen) {
      this._screenSpec.screenSize = 'xlarge';
    } else if (this._screenSpec.isXXLargeScreen) {
      this._screenSpec.screenSize = 'xxlarge';
    } else if (this._screenSpec.isXXXLargeScreen) {
      this._screenSpec.screenSize = 'xxxlarge';
    }

    for (const size in this._screenClasses) {
      document.body.classList.remove(this._screenClasses[size as TScreenSize]);
    }

    document.body.classList.add(this._screenClasses.small);
    if (width >= smallBreakpoint) document.body.classList.add(this._screenClasses.medium);
    if (width >= mediumBreakpoint) document.body.classList.add(this._screenClasses.large);
    if (width >= largeBreakpoint) document.body.classList.add(this._screenClasses.xlarge);
    if (width >= xlargeBreakpoint) document.body.classList.add(this._screenClasses.xxlarge);
    if (width >= xxlargeBreakpoint) document.body.classList.add(this._screenClasses.xxxlarge);

    if (!isBoolean(data)) {
      extend(this._screenSpec, data);
    }
    log.debug('spec updated', this._screenSpec);
    this.dispatch(
      'deviceScreenSpecificationChanged',
      this._screenSpec,
      oldSpec,
      this._screenSpec.screenSize !== oldSpec.screenSize
    );
  }

  public async keyboardClose() {
    if (!this.isCapacitor) return;
    await CapacitorKeyboard.hide();
  }

  public async keyboardOpen() {
    if (!this.isCapacitor) return;
    await CapacitorKeyboard.show();
  }

  private setupScreen() {
    window.addEventListener('resize', () => this.onScreenSpecChanged(), true);
    this.onScreenSpecChanged();
  }

  public get screenSpec() {
    return this._screenSpec;
  }
  public get screenWidth() {
    return this._screenSpec.width!;
  }
  public get screenHeight() {
    return this._screenSpec.height!;
  }
  public get isPortrait() {
    return !!this._screenSpec.isPortrait;
  }
  public get isLandscape() {
    return !!this._screenSpec.isLandscape;
  }
  public get screenSize() {
    return this._screenSpec.screenSize;
  }
  public get isSmallScreen() {
    return !!this._screenSpec.isSmallScreen;
  }
  public get isMediumScreen() {
    return !!this._screenSpec.isMediumScreen;
  }
  public get isLargeScreen() {
    return !!this._screenSpec.isLargeScreen;
  }
  public get isXLargeScreen() {
    return !!this._screenSpec.isXLargeScreen;
  }
  public get isXXLargeScreen() {
    return !!this._screenSpec.isXXLargeScreen;
  }
  public get isXXXLargeScreen() {
    return !!this._screenSpec.isXXXLargeScreen;
  }

  private async setupStatusBar() {
    if (!this.isCapacitor) return;
    try {
      await CapacitorStatusBar.setStyle({ style: StatusBarStyle.Default });
      await CapacitorStatusBar.show();
    } catch (error) {
      log.error('Failed to setup status bar:', error);
    }
  }

  private doResume() {
    this.restartIdle();
    this._foreground = true;
    log.debug('Device foreground');
    app.$errorManager.handlePromise(this.dispatchAsync('deviceForeground'));
  }

  private doPause() {
    this.stopIdle();
    this._foreground = false;
    app.$errorManager.handlePromise(this.dispatchAsync('deviceBackground'));
  }

  private setupBackground() {
    if (this.isNative) {
      document.addEventListener(
        this.isApple ? 'resign' : 'pause',
        () => {
          this.doPause();
        },
        false
      );
      document.addEventListener(
        'resume',
        () => {
          this.doResume();
        },
        false
      );
    } else {
      let hidden: 'hidden' | 'mozHidden' | 'msHidden' | 'webkitHidden';
      let visibilityChange: string | undefined;
      if (isDefined(document.hidden)) {
        // Opera 12.10 and Firefox 18 and later support
        hidden = 'hidden';
        visibilityChange = 'visibilitychange';
      } else if (isDefined(document.mozHidden)) {
        hidden = 'mozHidden';
        visibilityChange = 'mozvisibilitychange';
      } else if (isDefined(document.msHidden)) {
        hidden = 'msHidden';
        visibilityChange = 'msvisibilitychange';
      } else if (isDefined(document.webkitHidden)) {
        hidden = 'webkitHidden';
        visibilityChange = 'webkitvisibilitychange';
      }

      if (visibilityChange) {
        document.addEventListener(
          visibilityChange,
          () => {
            if (document[hidden]) {
              log.debug('App invisible');
              this.doPause();
            } else {
              log.debug('App visible');
              this.doResume();
            }
          },
          false
        );
      }

      window.addEventListener('pagehide', function () {
        log.debug('Page hidden');
        app.$device.doPause();
      });
      window.addEventListener('blur', function () {
        log.debug('Page blur');
        app.$device.doPause();
      });
      window.addEventListener('focus', function () {
        log.debug('Page focus');
        app.$device.doResume();
      });
    }
    this.doResume();
  }

  private rearmIdleTimer() {
    this._idleTimerId = setTimeout(() => this.onIdle(), IDLE_DELAY * 1000);
  }

  private onIdle() {
    this._idleCount++;
    const time = IDLE_DELAY * this._idleCount;
    log.debug('idle', time, 's');
    app.$errorManager.handlePromise(this.dispatchAsync('deviceIdle', time));
    this.rearmIdleTimer();
  }

  public restartIdle() {
    log.debug('idle', 'restart');
    this.stopIdle();
    this._idleCount = 0;
    this.rearmIdleTimer();
  }

  private stopIdle() {
    clearTimeout(this._idleTimerId);
  }

  private startIdle() {
    ['touchend', 'mousedown', 'keypress', 'touchmove'].forEach((eventName) => {
      document.addEventListener(eventName, () => this.restartIdle(), false);
    });
    this.restartIdle();
  }

  private async setupNetwork() {
    if (this.isCapacitor) {
      const status = await CapacitorNetwork.getStatus();
      this._isConnected = status.connected;

      await CapacitorNetwork.addListener('networkStatusChange', (status) => {
        this._isConnected = status.connected;
        if (this.isConnected) {
          log.debug('Network connected');
          app.$errorManager.handlePromise(this.dispatchAsync('deviceOnline'));
        } else {
          log.debug('Network disconnected');
          app.$errorManager.handlePromise(this.dispatchAsync('deviceOffline'));
        }
      });
    } else {
      this._isConnected = navigator.onLine;

      window.addEventListener(
        'offline',
        () => {
          this._isConnected = navigator.onLine;
          log.debug('offline', this.isConnected);
          app.$errorManager.handlePromise(this.dispatchAsync('deviceOffline'));
        },
        false
      );

      window.addEventListener(
        'online',
        () => {
          this._isConnected = navigator.onLine;
          log.debug('online', this.isConnected);
          app.$errorManager.handlePromise(this.dispatchAsync('deviceOnline'));
        },
        false
      );
    }
  }

  public async hideSplash() {
    if (!this.isCapacitor) return;
    await CapacitorSplashScreen.hide();
  }

  public isElectron(
    window: Window & typeof globalThis
  ): window is Window & typeof globalThis & { electron: IElectronHandler } {
    return !!window.electron;
  }
  public get hasWeb() {
    return this._hasWebkit;
  }
  public get isConnected() {
    return this._isConnected;
  }
  public get isMobile() {
    // This regex covers most of the phone browsers
    return (
      this.isNative ||
      /android|avantgo|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        navigator.userAgent
      )
    );
  }
  public get isNative() {
    return this.isCapacitor;
  }
  public get isCapacitor() {
    return isDefined(CapacitorCore) && CapacitorCore.isNativePlatform();
  }
  public get isBackground() {
    return !this._foreground;
  }
  public get isTouch() {
    return 'ontouchstart' in window || !!navigator.msMaxTouchPoints;
  }
  public get isAndroid() {
    return this._platform === 'android';
  }
  public get isApple() {
    return this._platform === 'ios';
  }
  public get isWeb() {
    return this._platform === 'web';
  }
  public get isDesktop() {
    return this._platform === 'desktop';
  }
  public get platform() {
    return this._platform;
  }
  public get language() {
    return this._language;
  }
  public get timeOffset() {
    return this._timeOffset;
  }
  public get screenClasses() {
    return this._screenClasses;
  }

  public get isIE() {
    const ua = navigator.userAgent;
    return ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;
  }

  public get isChrome() {
    const isChromium = window.chrome;
    const winNav = window.navigator;
    const vendorName = winNav.vendor;
    const isOpera = isDefined(window.opr);
    const isIEedge = winNav.userAgent.indexOf('Edge') > -1;
    const isIOSChrome = /CriOS/.exec(winNav.userAgent);

    if (isIOSChrome) {
      return false;
    } else if (
      isChromium !== null &&
      typeof isChromium !== 'undefined' &&
      vendorName === 'Google Inc.' &&
      isOpera === false &&
      isIEedge === false
    ) {
      return true;
    } else {
      return false;
    }
  }

  public openExternalLink(url: string) {
    if (this.isElectron(window)) {
      app.$errorManager.handlePromise(window.electron.ipcRenderer.invoke('openLink', url));
    } else {
      window.open(url, '_blank')!.focus();
    }
  }

  public async writeAndDownloadJson(defaultFileName: string, object: object, filePath?: string) {
    const jsonData = serialize(object);
    if (this.isElectron(window)) {
      await window.electron.ipcRenderer.invoke('writeJsonFile', defaultFileName, jsonData, filePath);
    } else {
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${defaultFileName}.json`;
      document.body.appendChild(a); // Nous devons ajouter l'élément au document pour que le clic fonctionne
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Nettoyer l'URL objet
    }
  }

  public async readFileUtf8(
    filters: TFileFilter[]
  ): Promise<string | { content: ArrayBuffer; name?: string } | undefined> {
    if (this.isDesktop) {
      const buffer = await window.electron!.ipcRenderer.invoke('readFileUtf8', filters);
      if (!buffer) return undefined;
      if (isString(buffer)) return buffer;
      // Supposant que result est le contenu du fichier en tant que Buffer
      // Convertissez le Buffer (Node.js) en ArrayBuffer si nécessaire
      return { content: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer };
    } else {
      // Mode web: Lire le fichier et renvoyer un objet avec ArrayBuffer
      return new Promise<{ content: ArrayBuffer; name?: string } | undefined>((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = filters.map((filter) => filter.extensions.map((ext) => `.${ext}`).join(',')).join(',');
        input.onchange = (e) => {
          const inputElement = e.target as HTMLInputElement;
          if (!inputElement) {
            reject(new Error('Aucune target'));
            return;
          }

          const file = inputElement.files ? inputElement.files[0] : undefined;
          if (!file) {
            reject(new Error('Aucun fichier sélectionné'));
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              content: reader.result as ArrayBuffer,
              name: file.name,
            });
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(file);
        };
        input.click();
      });
    }
  }
}
