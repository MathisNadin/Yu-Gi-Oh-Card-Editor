/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import Logger, { ILoggerSinkConfig } from './Logger';

export interface ILoggerWrapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (...args: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warning: (...args: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug: (...args: any[]) => void;
  configure: (config: ILoggerSinkConfig) => void;
}

export class Loggers {
  private loggers: { [name: string]: ILoggerWrapper } = {};

  public constructor() {}

  public createLogger(name: string): ILoggerWrapper {
    if (this.loggers[name]) return this.loggers[name];
    let logger = new Logger(this, name);

    this.loggers[name] = (() => {
      let _f: any = (...args: any[]) => {
        logger.info(...args);
      };
      _f.warning = (...args: any[]) => {
        logger.warning(...args);
      };
      _f.debug = (...args: any[]) => {
        logger.debug(...args);
      };
      _f.error = (...args: any[]) => {
        logger.error(...args);
      };
      _f.configure = (config: ILoggerSinkConfig) => {
        logger.configure(config);
      };
      return _f;
    })();

    return this.loggers[name];
  }
}
