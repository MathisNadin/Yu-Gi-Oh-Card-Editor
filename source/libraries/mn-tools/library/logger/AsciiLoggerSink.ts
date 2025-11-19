import { formatDate } from '../..';
import { AbstractLoggerSink, ILogRecord } from './AbstractLoggerSink';
import { LogLevel } from './Logger';

export class AsciiLoggerSink extends AbstractLoggerSink {
  public pipe(record: ILogRecord) {
    const args: unknown[] = record.data.slice(0);

    for (let i = 0, len = args.length; i < len; i++) {
      const value = args[i];

      if (typeof value === 'string') {
        const withoutAnsi = value.replace(/\x1b\[[^m]+m/g, '').replace(/\x1b/g, '');
        args[i] = withoutAnsi;
      }
    }

    args.unshift('<' + record.bulk + '>');
    args.unshift(formatDate(record.timestamp, '%d/%M %H:%m:%s'));

    if (record.logLevel === LogLevel.ERROR || record.logLevel === LogLevel.WARNING) {
      // eslint-disable-next-line prefer-spread
      console.error.apply(console, args);
    } else {
      // eslint-disable-next-line prefer-spread, no-console
      console.log.apply(console, args);
    }
  }
}
