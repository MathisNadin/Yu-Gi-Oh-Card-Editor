import { Capacitor as CapacitorCore } from '@capacitor/core';
import { Network as CapacitorNetwork } from '@capacitor/network';
import { Device as CapacitorDevice } from '@capacitor/device';
import { Keyboard as CapacitorKeyboard } from '@capacitor/keyboard';
import { SplashScreen as CapacitorSplashScreen } from '@capacitor/splash-screen';
import { StatusBar as CapacitorStatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import { extend, isBoolean, isDefined, isString, TLanguageLocale, logger, Observable, serialize } from 'mn-tools';
import { IApplicationListener } from '../../system';

interface IDeviceRecord {
  device: {
    id: string;
    native: boolean;
    platform: string;
    model: string;
    version: string;
    language: string;
    time: Date;
    timeOffset: number;
    screen: {
      width: number;
      height: number;
      pixelWidth: number;
    };
  };
  client: {
    // language: TLanguageLocale;
    name: string;
    stage: string;
    version: string;
    userAgent: string;
  };
}

export interface IScreenSpec {
  width: number;
  height: number;
  screenSize: TScreenSize;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  isXLargeScreen: boolean;
  isXXLargeScreen: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
}

export type TScreenSize = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';

export interface IDeviceListener {
  deviceScreenSpecificationChanged(newSpec: IScreenSpec, oldSpec: IScreenSpec): void;
  deviceForeground(): void;
  deviceBackground(): void;
  deviceOnline(): void;
  deviceOffline(): void;
  deviceBackButton(): void;
  deviceIdle(seconds: number): void;
  deviceInitialized(): void;
}

const log = logger('device');

const IDLE_DELAY = 5;

export class DeviceService extends Observable<IDeviceListener> implements Partial<IApplicationListener> {
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
  };

  public fireScreenSpecChanged(newSpec: IScreenSpec, oldSpec: IScreenSpec) {
    this.dispatch('deviceScreenSpecificationChanged', newSpec, oldSpec);
  }
  public fireForeground() {
    this.dispatch('deviceForeground');
  }
  public fireBackground() {
    this.dispatch('deviceBackground');
  }
  public fireOnline() {
    this.dispatch('deviceOnline');
  }
  public fireOffline() {
    this.dispatch('deviceOffline');
  }

  public constructor() {
    super();
    document.addEventListener(
      'backbutton',
      (event: Event) => {
        event.preventDefault();
        this.dispatch('deviceBackButton');
      },
      false
    );
    app.addListener(this);
  }

  public async getSpec() {
    const deviceRecord: IDeviceRecord = {
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
        // language: app.$i18n.currentLanguage,
        userAgent: navigator.userAgent,
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
    this.dispatch('deviceInitialized');
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

  private onScreenSpecChanged(data: boolean | IScreenSpec = false) {
    log.debug('onScreenSpecChanged');
    const oldSpec = { ...this._screenSpec };

    const smallBreakpoint = 576;
    const mediumBreakpoint = 768;
    const largeBreakpoint = 992;
    const xlargeBreakpoint = 1200;
    // const xxlargeBreakpoint = 1600;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = width < height;
    this._screenSpec = extend(this._screenSpec, {
      width,
      height,
      isSmallScreen: width <= smallBreakpoint,
      isMediumScreen: width > smallBreakpoint && width < mediumBreakpoint,
      isLargeScreen: width > mediumBreakpoint && width < largeBreakpoint,
      isXLargeScreen: width > largeBreakpoint && width < xlargeBreakpoint,
      isXXLargeScreen: width >= xlargeBreakpoint,
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
    }

    for (const size in this._screenClasses) {
      document.body.classList.remove(this._screenClasses[size as TScreenSize]);
    }

    document.body.classList.add(this._screenClasses.small);
    if (width > smallBreakpoint) document.body.classList.add(this._screenClasses.medium);
    if (width > mediumBreakpoint) document.body.classList.add(this._screenClasses.large);
    if (width > largeBreakpoint) document.body.classList.add(this._screenClasses.xlarge);
    if (width > xlargeBreakpoint) document.body.classList.add(this._screenClasses.xxlarge);

    if (!isBoolean(data)) {
      extend(this._screenSpec, data);
    }
    log.debug('spec updated', this._screenSpec);
    this.fireScreenSpecChanged(this._screenSpec, oldSpec);
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
    this.fireForeground();
  }

  private doPause() {
    this.stopIdle();
    this._foreground = false;
    this.fireBackground();
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
    this.dispatch('deviceIdle', time);
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
          this.fireOnline();
        } else {
          log.debug('Network disconnected');
          this.fireOffline();
        }
      });
    } else {
      this._isConnected = navigator.onLine;

      window.addEventListener(
        'offline',
        () => {
          this._isConnected = navigator.onLine;
          log.debug('offline', this.isConnected);
          this.fireOffline();
        },
        false
      );

      window.addEventListener(
        'online',
        () => {
          this._isConnected = navigator.onLine;
          log.debug('online', this.isConnected);
          this.fireOnline();
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
