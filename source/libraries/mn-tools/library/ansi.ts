import { isNumber, TJSONValue } from '..';

const underline = 4;
const notUnderline = 24;
const bold = 1;
const notBold = 22;
const italic = 2;
const notItalic = 22;
const strikeout = 9;
const notStrikeout = 29;
const black = 30;
const red = 31;
const green = 32;
const yellow = 33;
const blue = 34;
const magenta = 35;
const cyan = 36;
const white = 37;
const defaultForeground = 39;
// const defaultBackground = 49;
const brightBlack = 90;
const brightRed = 91;
const brightGreen = 92;
const brightYellow = 93;
const brightBlue = 94;
const brightMagenta = 95;
const brightCyan = 96;
const brightWhite = 97;

class Ansi {
  private fgFence(s: string, code: number) {
    return this.fence(s, code, defaultForeground);
  }
  private fence(s: string, start: number, stop: number) {
    if (typeof s === 'undefined') s = '';
    return `\u001b[${start}m${s}\u001b[${stop}m`;
  }

  public clearLine() {
    return '\u001b[2K';
  }
  public cursorUp() {
    return '\u001b[1A';
  }
  public beginOfLine() {
    return '\r';
  }
  public reset() {
    return '\u001b[0m';
  }
  public hideCursor() {
    return '\u001b[?25l';
  }
  public showCursor() {
    return '\u001b[?25h';
  }
  public rgb(color: number[], s: string) {
    return `\u001b[38;2;${color[0]};${color[1]};${color[2]}m${s}\u001b[38m${this.reset()}`;
  }
  public brgb(color: number[], s: string) {
    return `\u001b[48;2;${color[0]};${color[1]};${color[2]}m${s}\u001b[38m${this.reset()}`;
  }
  public underline(s: string): string {
    return this.fence(s, underline, notUnderline);
  }
  public bold(s: string): string {
    return this.fence(s, bold, notBold);
  }
  public italic(s: string): string {
    return this.fence(s, italic, notItalic);
  }
  public strikeout(s: string): string {
    return this.fence(s, strikeout, notStrikeout);
  }
  public white(s: string): string {
    return this.fgFence(s, white);
  }
  public black(s: string): string {
    return this.fgFence(s, black);
  }
  public blue(s: string): string {
    return this.fgFence(s, blue);
  }
  public cyan(s: string): string {
    return this.fgFence(s, cyan);
  }
  public green(s: string): string {
    return this.fgFence(s, green);
  }
  public magenta(s: string): string {
    return this.fgFence(s, magenta);
  }
  public red(s: string): string {
    return this.fgFence(s, red);
  }
  public yellow(s: string): string {
    return this.fgFence(s, yellow);
  }
  public brightBlack(s: string): string {
    return this.fgFence(s, brightBlack);
  }
  public brightRed(s: string): string {
    return this.fgFence(s, brightRed);
  }
  public brightGreen(s: string): string {
    return this.fgFence(s, brightGreen);
  }
  public brightYellow(s: string): string {
    return this.fgFence(s, brightYellow);
  }
  public brightBlue(s: string): string {
    return this.fgFence(s, brightBlue);
  }
  public brightMagenta(s: string): string {
    return this.fgFence(s, brightMagenta);
  }
  public brightCyan(s: string): string {
    return this.fgFence(s, brightCyan);
  }
  public brightWhite(s: string): string {
    return this.fgFence(s, brightWhite);
  }

  public table(headers: string[], rows: TJSONValue[][]): void {
    const columnWidths: number[] = [];
    headers.forEach((header, index) => {
      const maxLength = Math.max(header.length, ...rows.map((row) => this.filterAnsi(row[index]!).length));
      columnWidths[index] = maxLength + 2;
    });

    const topLine = '┌' + columnWidths.map((width) => '─'.repeat(width)).join('┬') + '┐';
    // eslint-disable-next-line no-console
    console.log(topLine);

    const headerRow =
      '│' + headers.map((header, index) => (' ' + header + ' ').padEnd(columnWidths[index]!)).join('│') + '│';
    // eslint-disable-next-line no-console
    console.log(headerRow);

    const separatorLine = '├' + columnWidths.map((width) => '─'.repeat(width)).join('┼') + '┤';
    // eslint-disable-next-line no-console
    console.log(separatorLine);

    rows.forEach((row) => {
      const rowString =
        '│' +
        row
          .map((value, index) => ' ' + this.formatValue(value) + ' ' + this.pad(value, columnWidths[index]!))
          .join('│'); // Remove ANSI formatting codes
      // eslint-disable-next-line no-console
      console.log(rowString + '│');
    });

    const bottomLine = '└' + columnWidths.map((width) => '─'.repeat(width)).join('┴') + '┘';
    // eslint-disable-next-line no-console
    console.log(bottomLine);
  }
  public filterAnsi(value: TJSONValue) {
    return `${value}`.replace(/\u001b\[\d+m/g, '');
  }

  private formatValue(value: TJSONValue) {
    // if (isString(value)) return ansi.red(value);
    if (isNumber(value)) return ansi.green(`${value}`);
    return `${value}`;
  }

  private pad(value: TJSONValue, width: number) {
    let padSize = width - this.filterAnsi(value).length - 2;
    return ' '.repeat(padSize);
  }
}

export let ansi = new Ansi();

const PROGRESS_SIZE = 20;

export class Progress {
  private _message: string;
  public get message() {
    return this._message;
  }

  private _total: number;
  public get total() {
    return this._total;
  }

  private _value: number;
  public get value() {
    return this._value;
  }

  public constructor(total: number) {
    this._message = '';
    this._total = total;
    this._value = 0;
    console.error();
    this.refresh();
  }

  public update(value: number, message: string) {
    this._value = value;
    this._message = message;
    this.refresh();
  }

  private refresh() {
    let pos = Math.round((PROGRESS_SIZE * this._value) / this._total);
    if (pos >= PROGRESS_SIZE) pos = PROGRESS_SIZE - 1;
    let progress = '[';
    for (let i = 0; i < PROGRESS_SIZE; i++) {
      if (i <= pos) {
        progress += '=';
      } else {
        progress += '-';
      }
    }
    progress += ']';
    console.error(
      `${ansi.cursorUp()}${ansi.beginOfLine()}${ansi.clearLine()}  ${progress} ${Math.round((100 * this._value) / this._total)}% ${this.message ? this.message : ''}`
    );
  }

  public hide() {
    console.error(`${ansi.cursorUp()}${ansi.beginOfLine()}${ansi.clearLine()}`);
  }
}
