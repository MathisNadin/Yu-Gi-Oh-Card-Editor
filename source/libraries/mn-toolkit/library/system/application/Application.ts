import { AbstractObservable, each, deepFreeze, isArray, sortDependencies } from 'mn-tools';
import { App as CapacitorApp } from '@capacitor/app';

export interface IApplicationListener {
  applicationReady: () => void | Promise<void>;
  applicationWillClose: () => string | undefined;
}

interface IServiceOptions<T> {
  depends?: (keyof IApp)[];
  name?: string;
  clazz?: new () => T;
  instance?: T;
}

export interface IBootstrapOptions {
  name: string;
  modules: string[];
}

export class Application extends AbstractObservable<IApplicationListener> {
  private configurationCallBack: () => void = () => {};
  private _services: Partial<Record<keyof IApp, IServiceOptions<unknown>>> = {};
  private _ready = false;
  private _conf: IApplicationConfig = {} as IApplicationConfig;

  public constructor(conf: IApplicationConfig) {
    super();
    this._conf = deepFreeze({
      ...conf,
      maxFileUploadSize: conf.maxFileUploadSize ?? 2 * 1024 * 1024 * 1024, // 2 Go
    });
    this.addListener(this);
  }

  public get conf() {
    return this._conf;
  }
  public get version() {
    return this._conf.version;
  }
  public get name() {
    return this._conf.name;
  }
  public get stage() {
    return this._conf.stage;
  }
  public get displayName() {
    return this._conf.displayName;
  }

  public get isProd() {
    return this.stage === 'production';
  }

  public get isReady() {
    return this._ready;
  }

  public async bootstrap() {
    this.bootstrapConfig();
    await this.bootstrapServices();
    await this.dispatchAsync('applicationReady');

    window.onbeforeunload = () => {
      const response = this.askForResponse('applicationWillClose');
      if (response) return response;
      return undefined;
    };
    /*     this.bootstrapDOM()
      .then(() => this.bootstrapServices())
      .then(() => app.$errorManager.handlePromise(this.dispatchAsync('applicationReady')))
      .catch((e: Error) => app.$errorManager.trigger(e)); */
  }

  public beforeBootstrap(fn: () => void) {
    this.configurationCallBack = fn;
    return this;
  }

  private bootstrapConfig() {
    window.vendors = window.vendors || ({} as IVendors);
    if (this.configurationCallBack) this.configurationCallBack();
  }

  public applicationReady() {
    setTimeout(() => app.$errorManager.handlePromise(app.$device.hideSplash()));
  }

  public async exit() {
    if (!app.$device.isCapacitor || app.$device.isApple) return; // Programatically exiting the app is prohibited on ios
    await CapacitorApp.exitApp();
  }

  private async bootstrapServices() {
    const graph: { [service: string]: (keyof IApp)[] } = {};

    each(this._services, (options, name) => {
      if (!options) return;

      const depends = options.depends ?? [];
      graph[name as keyof IApp] = depends;
    });

    const sortedGraph = sortDependencies(graph) as (keyof IApp)[];
    for (const serviceName of sortedGraph) {
      const service = app[serviceName] as { setup?: () => void | Promise<void> } | undefined;

      if (!service) {
        console.warn(`Le service ${String(serviceName)} n'existe pas`);
      } else if (typeof service.setup === 'function') {
        await service.setup();
      }
    }
  }

  public service<T>(name: keyof IApp, clazz: new () => T, options: IServiceOptions<T> = {}): void {
    if (!clazz) {
      throw new Error(`Nous avons besoin d'une classe pour ${String(name)}`);
    }

    const depends = options.depends ?? [];
    if (!isArray(depends)) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Mauvaises dépendances pour ${String(name)} : ${depends}`);
    }

    const serviceOptions: IServiceOptions<unknown> = {
      depends,
      name,
      clazz: clazz as new () => unknown,
      instance: undefined,
    };

    this._services[name] = serviceOptions;

    Object.defineProperty(this, name, {
      get: () => {
        const stored = this._services[name];

        if (!stored) {
          throw new Error(`Le service ${String(name)} n'est pas enregistré`);
        }

        if (!stored.instance) {
          try {
            const Ctor = stored.clazz as (new () => unknown) | undefined;
            if (!Ctor) {
              throw new Error(`La classe pour le service ${String(name)} est manquante.`);
            }
            stored.instance = new Ctor();
          } catch (error) {
            app.$errorManager.trigger(error as Error);
          }
        }

        return stored.instance;
      },
      configurable: false,
      enumerable: true,
    });
  }

  /*   private async bootstrapDOM() {
    return new Promise<void>(resolve => {
      // 7. On s'accroche maintenat à la disponibilité du DOM
      // pour bootstrapper l'application
      domReady(() => {
        polyfill({
          // use this to make use of the scroll behaviour
          // dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
        });
        window.addEventListener('touchmove', function () {});

        if (typeof (window as any).cordova !== 'undefined') {
          document.addEventListener(
            'deviceready',
            () => {
              resolve();
            },
            false
          );
        } else {
          resolve();
        }
      });
    });
  } */
}
