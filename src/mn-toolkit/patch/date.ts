import { monkeyPatch, monkeyPatchGet } from "mn-toolkit/tools";

let firstDayOfWeek = 1;

export type DateGranularity = 'minute' | 'minutes' | 'hour' | 'hours' | 'date' | 'time';

let object: { [name: string]: Function } = {};
object.setFirstDayOfWeek = function(value: number) {
  firstDayOfWeek = value;
};

object.getFirstDayOfWeek = function(this: Date) {
  return firstDayOfWeek;
};

object.getWeek = function(this: Date) {
  return firstDayOfWeek === 0 ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 0];
};

object.getDayIndex = function(day: number) {
  if (firstDayOfWeek === 1) {
    day -= 1;
    if (day < 0) day = 6;
  }
  return day;
};

object.beginOfYear = function(year: number) {
  return new Date(year, 0, 1);
};

object.endOfYear = function(year: number) {
  return new Date(year, 11, 31);
};

object.fromWeekNumber = function(w: number, y: number) {
  let simple = new Date(y, 0, 1 + (w - 1) * 7);
  let dow = simple.getDay();
  let isoWeekStart = simple;
  if (dow <= 4)
    isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else
    isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return isoWeekStart;
};

object.fromEpochDay = function(eday: number) {
  return new Date(Date.DAY * eday);
};


object.today = function(this: Date) {
  return new Date();
};

let prototype: { [name: string]: Function } = {};
prototype.isWeekEnd = function(this: Date) {
  return this.getDay() === 0 || this.getDay() === 6;
};

prototype.getDayIndex = function(this: Date) {
  let day = this.getDay();
  if (firstDayOfWeek === 1) {
    if (day === 0) day = 7;
    day -= 1;
  }
  return day;
};

prototype.getTruncatedTime = function(this: Date, granularity: DateGranularity) {
  let date;
  switch (granularity) {
    case 'minute':
    case 'minutes':
      date = new Date(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes());
      break;

    case 'hour':
    case 'hours':
      date = new Date(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours());
      break;


    case 'date':
      date = new Date(this.getFullYear(), this.getMonth(), this.getDate());
      break;

    case 'time':
    default:
      date = new Date(
        this.getFullYear(), this.getMonth(), this.getDate(),
        this.getHours(), this.getMinutes(), this.getSeconds());
      break;
  }
  return date.getTime();
};

prototype.truncate = function(granularity: DateGranularity) {
  this.setTime(this.getTruncatedTime(granularity));
  return this;
};

prototype.getEpochDays = function(this: Date) {
  return Math.floor((this.getTime() - this.getTimezoneOffset() * Date.MINUTE) / Date.DAY);
};

prototype.toBeginOfWeek = function(this: Date) {
  let day = this.getDay();
  let diff = this.getDate() - day;
  if (firstDayOfWeek === 1) {
    diff += day === 0 ? -6 : 1;
  }
  this.setDate(diff);
  return this;
};

prototype.toEndOfWeek = function(this: Date) {
  let diff;
  let day = this.getDay();
  if (firstDayOfWeek === 1) {
    day -= 1;
    if (day < 0) day = 6;
  }
  diff = this.getDate() - day + 6;
  this.setDate(diff);
  this.toEndOfDay();
  return this;
};

prototype.toEndOfMonth = function(this: Date) {
  let tmp = new Date(this.getFullYear(), this.getMonth() + 1, 0);
  this.setTime(tmp.getTime());
  this.toEndOfDay();
  return this;
};

prototype.toBeginOfMonth = function(this: Date) {
  this.setDate(1);
  return this;
};

function set(d: Date, m: number, h: number, s: number, ms: number) : Date {
  d.setMinutes(m);
  d.setHours(h);
  d.setSeconds(s);
  d.setMilliseconds(ms);
  return d;
}

prototype.toEndOfDay = function(this: Date) {
  return set(this, 59, 23, 59, 0);
};

prototype.toBeginOfDay = function(this: Date) {
  return set(this, 0, 0, 0, 0);
};

prototype.before = function(d: Date, granularity: DateGranularity) {
  d = d || new Date();
  return this.getTruncatedTime(granularity) < d.getTruncatedTime(granularity);
};

prototype.same = function(d: Date, granularity: DateGranularity) {
  d = d || new Date();
  return this.getTruncatedTime(granularity) === d.getTruncatedTime(granularity);
};


prototype.after = function(d?: Date, granularity?: DateGranularity) {
  d = d || new Date();
  return this.getTruncatedTime(granularity) > d.getTruncatedTime(granularity);
};


prototype.getWeekNumber = function(this: Date) {
  // Create a copy of d date object
  let target = this.clone();

  // ISO week date weeks start on monday
  // so correct the day number
  let dayNr = (this.getDay() + 6) % 7;

  // ISO 8601 states that week 1 is the week
  // with the first thursday of that year.
  // Set the target date to the thursday in the target week
  target.setDate(target.getDate() - dayNr + 3);

  // Store the millisecond value of the target date
  let firstThursday = target.valueOf();

  // Set the target to the first thursday of the year
  // First set the target to january first
  target.setMonth(0, 1);
  // Not a thursday? Correct the date to the next thursday
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }

  // The weeknumber is the number of weeks between the
  // first thursday of the year and the thursday in the target week
  return 1 + Math.ceil((firstThursday - target.getTime()) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000
};

prototype.addTime = function(this: Date, value: number) {
  this.setTime(this.getTime() + value);
  return this;
};

prototype.addSeconds = function(this: Date, value: number) {
  this.setSeconds(this.getSeconds() + value);
  return this;
};

prototype.addMinutes = function(this: Date, value: number) {
  this.setMinutes(this.getMinutes() + value);
  return this;
};

prototype.addHours = function(this: Date, value: number) {
  this.setHours(this.getHours() + value);
  return this;
};

prototype.addDays = function(this: Date, value: number) {
  this.setDate(this.getDate() + value);
  return this;
};

prototype.addWorkingDays = function(this: Date, value: number) {
  this.setDate(this.getDate() + value);
  if (this.getDay() === 6 || this.getDay() === 0) {
    this.toNextWeek().toBeginOfWeek();
  }
  return this;
};

prototype.addMonths = function(this: Date, value: number) {
  this.setMonth(this.getMonth() + value);
  return this;
};


prototype.toNextDay = function(this: Date) {
  return this.addDays(1);
};

prototype.toNextMonth = function(this: Date) {
  this.setMonth(this.getMonth() + 1);
  return this;
};

prototype.toPreviousMonth = function(this: Date) {
  this.setMonth(this.getMonth() - 1);
  return this;
};

prototype.toNextWeek = function(this: Date) {
  this.setDate(this.getDate() + 7);
  return this;
};

prototype.toNextYear = function(this: Date) {
  this.setFullYear(this.getFullYear() + 1);
  return this;
};

prototype.toPreviousYear = function(this: Date) {
  this.setFullYear(this.getFullYear() - 1);
  return this;
};


prototype.toPreviousWeek = function(this: Date) {
  this.setDate(this.getDate() - 7);
  return this;
};

prototype.clone = function(this: Date) {
  return new Date(this.getTime());
};

prototype.isThisMonth = function(this: Date) {
  let today = Date.today();
  return today.getFullYear() === this.getFullYear() && today.getMonth() === this.getMonth();
};

prototype.isNextMonth = function(this: Date) {
  let today = Date.today().toNextMonth();
  return today.getFullYear() === this.getFullYear() && today.getMonth() === this.getMonth();
};


prototype.isThisYear = function(this: Date) {
  return Date.today().getFullYear() === this.getFullYear();
};

prototype.generateDays = function(this: Date, to: Date) {
  let start = this.clone().toBeginOfDay();
  let stop = new Date(to.getTime()).toEndOfDay();
  let result: Date[] = [];
  while (start.before(stop)) {
    result.push(new Date(start));
    start.toNextDay();
  }
  return result;
};

prototype.generateCalendar = function(this: Date) {
  let start = this.clone().toBeginOfMonth().toBeginOfWeek();
  let stop = this.clone().toEndOfMonth().toEndOfWeek();
  return start.generateDays(stop);
};

prototype.isEndOfMonth = function(this: Date) {
  return new Date(this.getTime() + 86400000).getDate() === 1;
};
prototype.isBeginOfMonth = function(this: Date) {
  return this.getDate() === 1;
};
prototype.isBeginOfWeek = function(this: Date) {
  return this.getDay() === 1;
};
prototype.isEndOfWeek = function(this: Date) {
  return this.getDay() === 0;
};
prototype.beforeIncluding = function(d: Date, granularity: DateGranularity) {
  d = d || new Date();
  return this.getTruncatedTime(granularity) <= d.getTruncatedTime(granularity);
};

prototype.afterIncluding = function(d: Date, granularity: DateGranularity) {
  d = d || new Date();
  return this.getTruncatedTime(granularity) >= d.getTruncatedTime(granularity);
};

prototype.isToday = function(this: Date) {
  return this.same(new Date(), 'date');
};

prototype.isThisWeek = function(this: Date) {
  return this.isThisYear() && this.getWeekNumber() === new Date().getWeekNumber();
};

prototype.isNextWeek = function(this: Date) {
  return this.isThisYear() && this.getWeekNumber() === new Date().toNextWeek().getWeekNumber();
};


prototype.isPreviousWeek = function(this: Date) {
  return this.isThisYear() && this.getWeekNumber() === new Date().toPreviousWeek().getWeekNumber();
};


prototype.epochDifference = function(this: Date, to: Date) {
  let utc1 = Date.UTC(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds());
  let utc2 = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate(), to.getHours(), to.getMinutes(), to.getSeconds());
  return utc2 - utc1;
};

prototype.monthDifference = function(this: Date, d2: Date) {
  let d1 = this;
  d2 = d2 || new Date();
  let d1Y = d1.getFullYear();
  let d2Y = d2.getFullYear();
  let d1M = d1.getMonth();
  let d2M = d2.getMonth();
  return (d2M + 12 * d2Y) - (d1M + 12 * d1Y);
};

prototype.dayDifference = function(d2: Date): number {
  d2 = d2 || new Date();
  return Math.floor(Math.abs(d2.getTime() - this.getTime()) / (1000 * 60 * 60 * 24));
};


if (!Date.now) {
  Date.now = function now() {
    return new Date().getTime();
  };
}

prototype.getFrenchDay = function(this: Date) {
  let day = this.getDay() - 1;
  return day === -1 ? 6 : day;
};

prototype.toTimezone = function(offset: number) {
  let decay = (offset - new Date().getTimezoneOffset()) * 60000;
  return new Date(this.getTime() - decay);
};

function padStart(num: number) {
  let norm = Math.floor(Math.abs(num));
  return `${(norm < 10 ? '0' : '')}${norm}`;
}

prototype.toLocaleISOString = function(this: Date) {
  return `${this.getFullYear()}-${padStart(this.getMonth() + 1)}-${padStart(this.getDate())}T${padStart(this.getHours())}:${padStart(this.getMinutes())}:${padStart(this.getSeconds())}${Date.offsetToISO(this.getTimezoneOffset())}`;
};

object.offsetToISO = function(offset: number) {
  let tzo = -offset;
  let dif = tzo >= 0 ? '+' : '-';
  // eslint-disable-next-line prefer-template
  return dif + padStart(tzo / 60) +
    ':' + padStart(tzo % 60);
};

prototype.toISODateString = function(this: Date) {
  return `${this.getFullYear()}-${padStart(this.getMonth() + 1)}-${padStart(this.getDate())}`;
};

object.fromISODate = function(s: string) {
  let tokens = s.split(/-/);
  return new Date(parseInt(tokens[0], 10), parseInt(tokens[1], 10) - 1, parseInt(tokens[2], 10));
};

export function install() {
  monkeyPatchGet(Date, 'SECOND', { get: () => 1000 });
  monkeyPatchGet(Date, 'MINUTE', { get: () => 60000 });
  monkeyPatchGet(Date, 'HOUR', { get: () => 3600000 });
  monkeyPatchGet(Date, 'DAY', { get: () => 86400000 });

  for (let name in object) {
    monkeyPatch(Date, name, object[name]);
  }

  for (let name in prototype) {
    monkeyPatch(Date.prototype, name, prototype[name]);
  }
}

declare global {
  interface DateConstructor {
    SECOND: number;
    MINUTE: number;
    HOUR: number;
    DAY: number;
    WEEK_START: number;

    setFirstDayOfWeek(value: number): void;
    getFirstDayOfWeek(): number;
    getWeek(): number[];
    getDayIndex(day: number): number;
    beginOfYear(year: number): Date;
    endOfYear(year: number): Date;
    today(): Date;
    fromEpochDay(eday: number): Date;
    fromWeekNumber(week: number, yeay: number): Date;
    offsetToISO(offset: number): string;
    fromISODate(s: string): Date;
  }

  interface Date {
    truncate(granularity: DateGranularity): Date;
    toTimezone(offset: number) : Date;
    toLocaleISOString(): string;
    isWeekEnd(): boolean;
    getDayIndex(): number;
    getTruncatedTime(granularity?: DateGranularity): number;
    getEpochDays(): number;
    toBeginOfWeek(): Date;
    toEndOfWeek(): Date;
    toEndOfMonth(): Date;
    toBeginOfMonth(): Date;
    toEndOfDay(): Date;
    toBeginOfDay(): Date;
    before(d?: Date, granularity?: DateGranularity): boolean;
    same(d?: Date, granularity?: DateGranularity): boolean;
    after(d?: Date, granularity?: DateGranularity): boolean;
    getWeekNumber(): number;
    addTime(value: number): Date;
    addSeconds(value: number): Date;
    addMinutes(value: number): Date;
    addHours(value: number): Date;
    addDays(value: number): Date;
    addMonths(value: number): Date;
    toNextDay(): Date;
    toNextMonth(): Date;
    toPreviousMonth(): Date;
    toNextWeek(): Date;
    toNextYear(): Date;
    toPreviousYear(): Date;
    toPreviousWeek(): Date;
    clone(): Date;
    isThisMonth(): boolean;
    isNextMonth(): boolean;
    isThisYear(): boolean;
    generateDays(to: Date): Date[];
    generateCalendar(): Date[];
    isEndOfMonth(): boolean;
    isBeginOfMonth(): boolean;
    isBeginOfWeek(): boolean;
    isEndOfWeek(): boolean;
    beforeIncluding(d?: Date, granularity?: DateGranularity): boolean;
    afterIncluding(d?: Date, granularity?: DateGranularity): boolean;
    isToday(): boolean;
    isThisWeek(): boolean;
    isNextWeek(): boolean;
    isPreviousWeek(): boolean;
    epochDifference(to: Date): number;
    monthDifference(d2?: Date): number;
    addWorkingDays(value: number): Date;
    toISODateString() : string;
    dayDifference(d2?: Date): number;
    getFrenchDay(): number;
  }
}
