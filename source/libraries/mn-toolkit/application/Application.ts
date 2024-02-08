import { each, sortDependencies } from 'libraries/mn-tools';
import { Observable } from '../observable';

export interface IApplicationListener {
  applicationReady(): void;
}

export interface IApplicationConfig {
  name: string;
  displayName: string;
  stage: string;
  version: string;
  apiUrl?: string;
  dbName?: string;
  objectStoreName?: string;
  debug?: boolean;
}

interface IServiceOptions<T> {
  depends?: (keyof IApp)[];
  name?: string;
  clazz?: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instance?: any;
}

export interface IBootstrapOptions {
  name: string;
  modules: string[];
}

/**
 * Core engine to boostrap the application.
 *
 */
export class Application extends Observable<IApplicationListener> {
  // implements IApplicationListener
  private configurationCallBack: () => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _services: { [name: string]: IServiceOptions<any> } = {};
  private _ready = false;
  private _conf: IApplicationConfig = {} as IApplicationConfig;

  /**
   * Default constructor.
   */
  public constructor() {
    super();
    // this.patchPreact();
    // this.addListener(this);
  }

  /* public static initialize(conf: IApplicationConfig): Application {
    app._conf = conf;
    return app;
  } */

  public get conf() {
    return this._conf;
  }
  public set conf(conf: IApplicationConfig) {
    this._conf = conf;
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

  private fireReady() {
    this.dispatch('applicationReady');
  }

  /**
   * main function.
   */
  public bootstrap() {
    this.bootstrapConfig();
    this.bootstrapServices()
      .then(() => this.fireReady())
      // eslint-disable-next-line no-console
      .catch((e: Error) => console.error(e));
    /*     this.bootstrapDOM()
      .then(() => this.bootstrapServices())
      .then(() => this.fireReady())
      .catch((e: Error) => app.$errorManager.trigger(e)); */
  }

  public beforeBootstrap(fn: () => void) {
    this.configurationCallBack = fn;
    return this;
  }

  /**
   * Load the configuration.
   */
  private bootstrapConfig() {
    window.vendors = window.vendors || ({} as IVendors);
    if (this.configurationCallBack) this.configurationCallBack();
  }

  /*   public get isProd(): boolean {
    return this.stage === 'prod';
  } */

  /*   public get hasCordova() {
    return typeof (window as any).cordova !== 'undefined';
  } */

  /*   public exit() {
    if (this.hasCordova) (navigator as any).app.exitApp();
  } */

  private async bootstrapServices() {
    const graph: { [service: string]: string[] } = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    each(this._services, (options: IServiceOptions<any>, name: string) => {
      if ((this._services[name].depends as (keyof IApp)[]).length === 0 && !this._services[name].clazz.prototype.setup)
        return;
      graph[name] = options.depends as (keyof IApp)[];
    });

    const sortedGraph = sortDependencies(graph);
    // eslint-disable-next-line no-restricted-syntax
    for (const serviceName of sortedGraph) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = (app as any)[serviceName];
      if (!service) {
        // eslint-disable-next-line no-console
        console.warn(`Le service ${serviceName} n'existe pas`);
      } else if (service.setup) {
        // eslint-disable-next-line no-console
        service.setup().catch((e: Error) => console.error(e));
      }
    }
  }

  /*   public applicationReady() {
    setTimeout(() => app.$device.hideSplash());
  } */

  /**
   * Add a new service.
   *
   * @param {string} name
   * @param {Class} clazz
   * @param {Object} options
   */
  public service<T>(name: keyof IApp, clazz: T, options: IServiceOptions<T> = {}) {
    if (!clazz) throw new Error(`Nous avons besoin d'une classe pour ${name}`);
    options.depends = options.depends || [];
    if (!Array.isArray(options.depends)) throw new Error(`Mauvaises dépendances pour ${name} : ${options.depends}`);
    options.name = name;
    options.clazz = clazz;
    this._services[name] = options;
    Object.defineProperty(this, name, {
      get: () => {
        if (!this._services[name].instance) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this._services[name].instance = new (clazz as any)();
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
          }
        }
        return this._services[name].instance;
      },
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

  public get isReady() {
    return this._ready;
  }
}
