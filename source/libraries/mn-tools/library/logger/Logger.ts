import { AbstractLoggerSink, ILogRecord } from './AbstractLoggerSink';
import { AnsiLoggerSinkRenderer } from './AnsiLoggerSink';
import { BrowserLoggerSinkRenderer } from './BrowserLoggerSink';
import { Loggers } from './Loggers';

export interface ILoggerSinkConfig {
  engine?: AbstractLoggerSink;
  logLevel?: LogLevel;
}

export enum LogLevel {
  ERROR = 0,
  WARNING = 1,
  INFO = 2,
  DEBUG = 3,
}

export default class Logger {
  private config: { name: string; sink: ILoggerSinkConfig };

  public configure(config: ILoggerSinkConfig) {
    this.config.sink = { ...this.config.sink, ...config };
  }

  public constructor(_parent: Loggers, name: string) {
    this.config = {
      name,
      sink: {
        engine: typeof window === 'undefined' ? new AnsiLoggerSinkRenderer() : new BrowserLoggerSinkRenderer(),
        logLevel: LogLevel.INFO,
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private log(level: LogLevel, ...args: any[]) {
    const record: ILogRecord = {
      timestamp: new Date(),
      logLevel: level,
      bulk: this.config.name,
      data: args,
    };

    if (level <= (this.config.sink.logLevel as LogLevel)) {
      (this.config.sink.engine as AbstractLoggerSink).pipe(record);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public info(...args: any[]) {
    this.log(LogLevel.INFO, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public warning(...args: any[]) {
    this.log(LogLevel.WARNING, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public debug(...args: any[]) {
    this.log(LogLevel.DEBUG, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public error(...args: any[]) {
    this.log(LogLevel.ERROR, ...args);
  }
}
