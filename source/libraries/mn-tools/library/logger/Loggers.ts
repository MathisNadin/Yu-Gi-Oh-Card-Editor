import Logger, { ILoggerSinkConfig } from './Logger';

export interface ILoggerWrapper {
  (...args: unknown[]): void;
  error: (...args: unknown[]) => void;
  warning: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  configure: (config: ILoggerSinkConfig) => void;
}

export class Loggers {
  private loggers: Record<string, ILoggerWrapper> = {};

  public createLogger(name: string): ILoggerWrapper {
    const existing = this.loggers[name];
    if (existing) return existing;

    const logger = new Logger(this, name);

    const wrapper = ((...args: unknown[]) => {
      logger.info(...args);
    }) as ILoggerWrapper;

    wrapper.warning = (...args: unknown[]) => {
      logger.warning(...args);
    };

    wrapper.debug = (...args: unknown[]) => {
      logger.debug(...args);
    };

    wrapper.error = (...args: unknown[]) => {
      logger.error(...args);
    };

    wrapper.configure = (config: ILoggerSinkConfig) => {
      logger.configure(config);
    };

    this.loggers[name] = wrapper;
    return wrapper;
  }
}
