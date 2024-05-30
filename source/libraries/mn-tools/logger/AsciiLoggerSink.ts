import { formatDate } from '..';
import { AbstractLoggerSink, ILogRecord } from './AbstractLoggerSink';
import { LogLevel } from './Logger';

export class AsciiLoggerSink extends AbstractLoggerSink {
  public pipe(record: ILogRecord) {
    let args = record.data.slice(0);
    for (let i = 0, len = args.length; i < len; i++) {
      if (typeof args[i] === 'string') {
        args[i] = args[i].replace(/\x1b\[[^m]+m/g, '');
        args[i] = args[i].replace(/\x1b/g, '');
      }
    }
    args.unshift('<' + record.bulk + '>');
    args.unshift(formatDate(record.timestamp, '%d/%M %H:%m:%s'));
    if (record.logLevel === LogLevel.ERROR || record.logLevel === LogLevel.WARNING) {
      // eslint-disable-next-line prefer-spread, @typescript-eslint/no-explicit-any
      console.error.apply(console, args as any);
    } else {
      // eslint-disable-next-line prefer-spread, @typescript-eslint/no-explicit-any, no-console
      console.log.apply(console, args as any);
    }
  }
}
