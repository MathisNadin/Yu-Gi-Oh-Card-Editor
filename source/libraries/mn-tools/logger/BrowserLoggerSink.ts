import { AbstractLoggerSink, ILogRecord } from './AbstractLoggerSink';

const COLORS = [
  '#6DDCD4',
  '#76E299',
  '#9BEC66',
  '#E2D849',
  '#EE702D',
  '#DF3A4D',
  '#D05EB0',
  '#CA77DA',
  '#8163D0',
  '#7CBDDF',
  '#DDA736',
  '#D6ED43',
  '#D4137D',
  '#F04EE0',
  '#FFA500',
  '#4D4D4D',
  '#A530D0',
  '#30D039',
  '#6191F4',
  '#F461C0',
  '#91773F',
  '#C91D77',
  '#A98497',
  '#67DAAE',
];

export class BrowserLoggerSinkRenderer extends AbstractLoggerSink {
  private icolor = 0;
  private colorMap: { [name: string]: string } = {};

  private rgba(hex: string, opacity: number): string {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '#FF00FF';
    return `rgba(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)},${opacity})`;
  }

  private label(color: string) {
    return (
      'border-left: 6px solid ' +
      color +
      '; padding: 1px 3px; color: #272727; background-color: ' +
      this.rgba(color, 0.2) +
      '; border-radius: 2px;'
    );
  }

  public pipe(record: ILogRecord) {
    let prefixes = [record.bulk];
    let colors = [];

    if (!this.colorMap[record.bulk]) {
      this.colorMap[record.bulk] = COLORS[this.icolor];
      this.icolor++;
      if (this.icolor === COLORS.length) {
        this.icolor = 0;
      }
    }
    colors.push(this.label(this.colorMap[record.bulk]));
    let args = record.data.slice(0);
    colors.reverse();
    colors.forEach((a) => {
      args.unshift(a);
    });
    args.unshift('%c' + prefixes.join('%c'));
    // eslint-disable-next-line prefer-spread, @typescript-eslint/no-explicit-any, no-console
    console.log.apply(console, args as any);
  }
}
