import { LogLevel } from './Logger';

export interface ILogRecord {
  timestamp: Date;
  logLevel: LogLevel;
  bulk: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}

export class AbstractLoggerSink {
  public pipe(_record: ILogRecord) {}
}
