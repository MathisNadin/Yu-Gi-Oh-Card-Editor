export * from './AbstractLoggerSink';
export * from './AnsiLoggerSink';
export * from './BrowserLoggerSink';
export * from './Logger';
export * from './Loggers';

import { Loggers } from './Loggers';

export let loggers = new Loggers();

export let logger = (name: string) => {
  return loggers.createLogger(name);
};
