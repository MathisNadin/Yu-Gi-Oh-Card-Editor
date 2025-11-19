import { formatDate, isString } from '../..';
import { AbstractLoggerSink, ILogRecord } from './AbstractLoggerSink';
import { LogLevel } from './Logger';

const ansiCodes = {
  underline: 4,
  bold: 1,
  italic: 2,
  strikeout: 9,
  gray: 37,
  white: 37,
  black: 30,
  blue: 34,
  cyan: 36,
  green: 32,
  magenta: 35,
  red: 31,
  yellow: 33,
  brightBlack: 90,
  brightRed: 91,
  brightGreen: 92,
  brightYellow: 93,
  brightBlue: 94,
  brightMagenta: 95,
  brightCyan: 96,
  brightWhite: 97,
};

class Ansi {
  private fence(s: string, code: number) {
    let o = `\u001b[${code}m`;
    let c = '\u001b[39m\u001b[0m';

    return o + s + c;
  }
  public underline(s: string) {
    return this.fence(s, ansiCodes.underline);
  }
  public bold(s: string) {
    return this.fence(s, ansiCodes.bold);
  }
  public italic(s: string) {
    return this.fence(s, ansiCodes.italic);
  }
  public strikeout(s: string) {
    return this.fence(s, ansiCodes.strikeout);
  }
  public gray(s: string) {
    return this.fence(s, ansiCodes.gray);
  }
  public white(s: string) {
    return this.fence(s, ansiCodes.white);
  }
  public black(s: string) {
    return this.fence(s, ansiCodes.black);
  }
  public blue(s: string) {
    return this.fence(s, ansiCodes.blue);
  }
  public cyan(s: string) {
    return this.fence(s, ansiCodes.cyan);
  }
  public green(s: string) {
    return this.fence(s, ansiCodes.green);
  }
  public magenta(s: string) {
    return this.fence(s, ansiCodes.magenta);
  }
  public red(s: string) {
    return this.fence(s, ansiCodes.red);
  }
  public yellow(s: string) {
    return this.fence(s, ansiCodes.yellow);
  }
  public brightBlack(s: string) {
    return this.fence(s, ansiCodes.brightBlack);
  }
  public brightRed(s: string) {
    return this.fence(s, ansiCodes.brightRed);
  }
  public brightGreen(s: string) {
    return this.fence(s, ansiCodes.brightGreen);
  }
  public brightYellow(s: string) {
    return this.fence(s, ansiCodes.brightYellow);
  }
  public brightBlue(s: string) {
    return this.fence(s, ansiCodes.brightBlue);
  }
  public brightMagenta(s: string) {
    return this.fence(s, ansiCodes.brightMagenta);
  }
  public brightCyan(s: string) {
    return this.fence(s, ansiCodes.brightCyan);
  }
  public brightWhite(s: string) {
    return this.fence(s, ansiCodes.brightWhite);
  }
}

let ansi = new Ansi();

function hasStringStack(value: unknown): value is { stack: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'stack' in value &&
    typeof (value as { stack: unknown }).stack === 'string'
  );
}

export class AnsiLoggerSinkRenderer extends AbstractLoggerSink {
  public pipe(record: ILogRecord): void {
    let prefix = record.bulk;
    let output: typeof console.log;

    switch (record.logLevel) {
      case LogLevel.DEBUG:
        prefix = ansi.magenta(prefix);
        // eslint-disable-next-line no-console
        output = console.log;
        break;

      case LogLevel.ERROR:
        prefix = ansi.red(prefix);
        output = console.error;
        break;

      case LogLevel.WARNING:
        prefix = ansi.yellow(prefix);
        output = console.warn || console.error;
        break;

      default:
        prefix = ansi.blue(prefix);
        // eslint-disable-next-line no-console
        output = console.log;
        break;
    }

    const args: unknown[] = record.data.slice(0).flatMap((data): unknown => {
      if (
        hasStringStack(data) ||
        (typeof data === 'object' && data !== null && isString((data as { stack: unknown }).stack))
      ) {
        const stackStr = String((data as { stack?: string }).stack ?? '');
        const stack = `\n${stackStr.split(/\n/).slice(1).join('\n')}`;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { stack: _stack, ...rest } = data as { stack?: string; [k: string]: unknown };
        return [stack, rest];
      }

      return data;
    });

    args.unshift(prefix);
    args.unshift(ansi.gray(formatDate(record.timestamp, '%d/%M %H:%m:%s')));

    output.apply(console, args);
  }
}
