import { monkeyPatch, monkeyPatchGet } from '../..';

// Global variable to store the first day of the week (0 = Sunday, 1 = Monday)
let firstDayOfWeek = 1;

// Type for date granularity used in truncation methods
export type TDateGranularity = 'minute' | 'minutes' | 'hour' | 'hours' | 'date' | 'time';

/**
 * Static methods added to the Date constructor.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const object: { [name: string]: Function } = {};

/**
 * Set the first day of the week.
 * @param value - 0 for Sunday or 1 for Monday.
 */
object.setFirstDayOfWeek = function (value: number): void {
  firstDayOfWeek = value;
};

/**
 * Get the current first day of the week.
 * @returns The first day (0 for Sunday, 1 for Monday).
 */
object.getFirstDayOfWeek = function (this: Date): number {
  return firstDayOfWeek;
};

/**
 * Get an array representing the week order based on the first day of the week.
 * @returns An array of day indices (0-6) in the desired order.
 */
object.getWeek = function (): number[] {
  return firstDayOfWeek === 0 ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 0];
};

/**
 * Adjust a given day index based on the first day of the week.
 * @param day - The original day index (0-6).
 * @returns The adjusted day index.
 */
object.getDayIndex = function (day: number): number {
  if (firstDayOfWeek === 1) {
    day -= 1;
    if (day < 0) day = 6;
  }
  return day;
};

/**
 * Get the first day of a given year.
 * @param year - The year.
 * @returns A Date representing January 1st of the given year.
 */
object.beginOfYear = function (year: number): Date {
  return new Date(year, 0, 1);
};

/**
 * Get the last day of a given year.
 * @param year - The year.
 * @returns A Date representing December 31st of the given year.
 */
object.endOfYear = function (year: number): Date {
  return new Date(year, 11, 31);
};

/**
 * Get the starting date of the ISO week number in a given year.
 * @param w - The ISO week number.
 * @param y - The year.
 * @returns A Date representing the first day of the ISO week.
 */
object.fromWeekNumber = function (w: number, y: number): Date {
  let simple = new Date(y, 0, 1 + (w - 1) * 7);
  let dow = simple.getDay();
  let isoWeekStart = new Date(simple.getTime());
  if (dow <= 4) {
    isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  return isoWeekStart;
};

/**
 * Create a Date from an epoch day (number of days since Unix epoch).
 * @param eday - The number of days since January 1, 1970.
 * @returns A Date corresponding to the epoch day.
 */
object.fromEpochDay = function (eday: number): Date {
  return new Date(Date.DAY * eday);
};

/**
 * Get the current date and time.
 * @returns A new Date object representing now.
 */
object.today = function (this: Date): Date {
  return new Date();
};

/**
 * Convert a timezone offset in minutes to an ISO formatted offset string.
 * @param offset - Timezone offset in minutes.
 * @returns An ISO formatted offset string (e.g., "+02:00").
 */
object.offsetToISO = function (offset: number): string {
  const tzo = -offset;
  const sign = tzo >= 0 ? '+' : '-';
  return sign + padStart(tzo / 60) + ':' + padStart(tzo % 60);
};

/**
 * Create a Date from an ISO date string (YYYY-MM-DD).
 * @param s - The ISO date string.
 * @returns A Date object.
 */
object.fromISODate = function (s: string): Date {
  const tokens = s.split(/-/);
  return new Date(parseInt(tokens[0] ?? '', 10), parseInt(tokens[1] ?? '', 10) - 1, parseInt(tokens[2] ?? '', 10));
};

//------------------------------------------------------------------------------
// Prototype methods for Date
//------------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const prototype: { [name: string]: Function } = {};

/**
 * Check if the date is a weekend (Saturday or Sunday).
 * @returns True if weekend, false otherwise.
 */
prototype.isWeekEnd = function (this: Date): boolean {
  const day = this.getDay();
  return day === 0 || day === 6;
};

/**
 * Get the adjusted day index based on the first day of the week.
 * @returns The adjusted day index (0-6).
 */
prototype.getDayIndex = function (this: Date): number {
  let day = this.getDay();
  if (firstDayOfWeek === 1) {
    if (day === 0) day = 7;
    day -= 1;
  }
  return day;
};

/**
 * Get the timestamp truncated to the specified granularity.
 * @param granularity - The level of truncation.
 * @returns The truncated timestamp.
 */
prototype.getTruncatedTime = function (this: Date, granularity: TDateGranularity = 'time'): number {
  let date: Date;
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
        this.getFullYear(),
        this.getMonth(),
        this.getDate(),
        this.getHours(),
        this.getMinutes(),
        this.getSeconds()
      );
      break;
  }
  return date.getTime();
};

/**
 * Truncate the date to the specified granularity (modifies in place).
 * @param granularity - The level of truncation.
 * @returns The modified Date object.
 */
prototype.truncate = function (this: Date, granularity: TDateGranularity): Date {
  this.setTime(this.getTruncatedTime(granularity));
  return this;
};

/**
 * Get the number of epoch days since Unix epoch.
 * @returns The number of days.
 */
prototype.getEpochDays = function (this: Date): number {
  return Math.floor((this.getTime() - this.getTimezoneOffset() * Date.MINUTE) / Date.DAY);
};

/**
 * Set the date to the beginning of the week (modifies in place).
 * @returns The modified Date object.
 */
prototype.toBeginOfWeek = function (this: Date): Date {
  const day = this.getDay();
  let diff = this.getDate() - day;
  if (firstDayOfWeek === 1) {
    diff += day === 0 ? -6 : 1;
  }
  this.setDate(diff);
  return this;
};

/**
 * Set the date to the end of the week (modifies in place) and set time to end of day.
 * @returns The modified Date object.
 */
prototype.toEndOfWeek = function (this: Date): Date {
  let day = this.getDay();
  if (firstDayOfWeek === 1) {
    day = day === 0 ? 6 : day - 1;
  }
  const diff = this.getDate() - day + 6;
  this.setDate(diff);
  this.toEndOfDay();
  return this;
};

/**
 * Set the date to the end of the month (modifies in place).
 * @returns The modified Date object.
 */
prototype.toEndOfMonth = function (this: Date): Date {
  const tmp = new Date(this.getFullYear(), this.getMonth() + 1, 0);
  this.setTime(tmp.getTime());
  this.toEndOfDay();
  return this;
};

/**
 * Set the date to the beginning of the month (modifies in place).
 * @returns The modified Date object.
 */
prototype.toBeginOfMonth = function (this: Date): Date {
  this.setDate(1);
  return this;
};

/**
 * Helper function to set time components.
 * @param d - The date object to modify.
 * @param m - Minutes.
 * @param h - Hours.
 * @param s - Seconds.
 * @param ms - Milliseconds.
 * @returns The modified Date object.
 */
function set(d: Date, m: number, h: number, s: number, ms: number): Date {
  d.setMinutes(m);
  d.setHours(h);
  d.setSeconds(s);
  d.setMilliseconds(ms);
  return d;
}

/**
 * Set the time to the end of the day (23:59:59.999).
 * @returns The modified Date object.
 */
prototype.toEndOfDay = function (this: Date): Date {
  return set(this, 59, 23, 59, 999);
};

/**
 * Set the time to the beginning of the day (00:00:00.000).
 * @returns The modified Date object.
 */
prototype.toBeginOfDay = function (this: Date): Date {
  return set(this, 0, 0, 0, 0);
};

/**
 * Check if this date is before another date at the specified granularity.
 * @param d - The date to compare with (default: now).
 * @param granularity - The level of truncation.
 * @returns True if this date is before the other.
 */
prototype.before = function (this: Date, d?: Date, granularity: TDateGranularity = 'time'): boolean {
  d = d || new Date();
  return this.getTruncatedTime(granularity) < d.getTruncatedTime(granularity);
};

/**
 * Check if this date is equal to another date at the specified granularity.
 * @param d - The date to compare with (default: now).
 * @param granularity - The level of truncation.
 * @returns True if both dates are equal at the given granularity.
 */
prototype.same = function (this: Date, d?: Date, granularity: TDateGranularity = 'time'): boolean {
  d = d || new Date();
  return this.getTruncatedTime(granularity) === d.getTruncatedTime(granularity);
};

/**
 * Check if this date is after another date at the specified granularity.
 * @param d - The date to compare with (default: now).
 * @param granularity - The level of truncation.
 * @returns True if this date is after the other.
 */
prototype.after = function (this: Date, d?: Date, granularity: TDateGranularity = 'time'): boolean {
  d = d || new Date();
  return this.getTruncatedTime(granularity) > d.getTruncatedTime(granularity);
};

/**
 * Get the ISO week number for this date.
 * @returns The ISO week number.
 */
prototype.getWeekNumber = function (this: Date): number {
  // Create a copy of d date object
  const target = this.clone();

  // ISO week date weeks start on monday
  // so correct the day number
  const dayNr = (this.getDay() + 6) % 7;

  // ISO 8601 states that week 1 is the week
  // with the first thursday of that year.
  // Set the target date to the thursday in the target week
  target.setDate(target.getDate() - dayNr + 3);

  // Store the millisecond value of the target date
  const firstThursday = target.valueOf();

  // Set the target to the first thursday of the year
  // First set the target to january first
  target.setMonth(0, 1);

  // Not a thursday? Correct the date to the next thursday
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }

  return 1 + Math.ceil((firstThursday - target.getTime()) / 604800000);
};

/**
 * Add a given time value (in milliseconds) to the date.
 * @param value - Milliseconds to add.
 * @returns The modified Date object.
 */
prototype.addTime = function (this: Date, value: number): Date {
  this.setTime(this.getTime() + value);
  return this;
};

/**
 * Add seconds to the date.
 * @param value - Seconds to add.
 * @returns The modified Date object.
 */
prototype.addSeconds = function (this: Date, value: number): Date {
  this.setSeconds(this.getSeconds() + value);
  return this;
};

/**
 * Add minutes to the date.
 * @param value - Minutes to add.
 * @returns The modified Date object.
 */
prototype.addMinutes = function (this: Date, value: number): Date {
  this.setMinutes(this.getMinutes() + value);
  return this;
};

/**
 * Add hours to the date.
 * @param value - Hours to add.
 * @returns The modified Date object.
 */
prototype.addHours = function (this: Date, value: number): Date {
  this.setHours(this.getHours() + value);
  return this;
};

/**
 * Add days to the date.
 * @param value - Days to add.
 * @returns The modified Date object.
 */
prototype.addDays = function (this: Date, value: number): Date {
  this.setDate(this.getDate() + value);
  return this;
};

/**
 * Add working days (skipping weekends) to the date.
 * @param value - Working days to add.
 * @returns The modified Date object.
 */
prototype.addWorkingDays = function (this: Date, value: number): Date {
  this.setDate(this.getDate() + value);
  if (this.getDay() === 6 || this.getDay() === 0) {
    this.toNextWeek().toBeginOfWeek();
  }
  return this;
};

/**
 * Add months to the date.
 * @param value - Months to add.
 * @returns The modified Date object.
 */
prototype.addMonths = function (this: Date, value: number): Date {
  this.setMonth(this.getMonth() + value);
  return this;
};

/**
 * Move to the next day.
 * @returns The modified Date object.
 */
prototype.toNextDay = function (this: Date): Date {
  return this.addDays(1);
};

/**
 * Move to the next month.
 * @returns The modified Date object.
 */
prototype.toNextMonth = function (this: Date): Date {
  this.setMonth(this.getMonth() + 1);
  return this;
};

/**
 * Move to the previous month.
 * @returns The modified Date object.
 */
prototype.toPreviousMonth = function (this: Date): Date {
  this.setMonth(this.getMonth() - 1);
  return this;
};

/**
 * Move to the next week.
 * @returns The modified Date object.
 */
prototype.toNextWeek = function (this: Date): Date {
  this.setDate(this.getDate() + 7);
  return this;
};

/**
 * Move to the previous week.
 * @returns The modified Date object.
 */
prototype.toPreviousWeek = function (this: Date): Date {
  this.setDate(this.getDate() - 7);
  return this;
};

/**
 * Move to the next year.
 * @returns The modified Date object.
 */
prototype.toNextYear = function (this: Date): Date {
  this.setFullYear(this.getFullYear() + 1);
  return this;
};

/**
 * Move to the previous year.
 * @returns The modified Date object.
 */
prototype.toPreviousYear = function (this: Date): Date {
  this.setFullYear(this.getFullYear() - 1);
  return this;
};

/**
 * Clone the date.
 * @returns A new Date object with the same time.
 */
prototype.clone = function (this: Date): Date {
  return new Date(this.getTime());
};

/**
 * Check if the date is in the current month.
 * @returns True if it is this month.
 */
prototype.isThisMonth = function (this: Date): boolean {
  const today = Date.today();
  return today.getFullYear() === this.getFullYear() && today.getMonth() === this.getMonth();
};

/**
 * Check if the date is in the next month.
 * @returns True if it is next month.
 */
prototype.isNextMonth = function (this: Date): boolean {
  const today = Date.today().toNextMonth();
  return today.getFullYear() === this.getFullYear() && today.getMonth() === this.getMonth();
};

/**
 * Check if the date is in the current year.
 * @returns True if it is this year.
 */
prototype.isThisYear = function (this: Date): boolean {
  return Date.today().getFullYear() === this.getFullYear();
};

/**
 * Generate an array of Date objects for each day from this date to a target date.
 * @param to - The end date.
 * @returns An array of Date objects.
 */
prototype.generateDays = function (this: Date, to: Date): Date[] {
  const start = this.clone().toBeginOfDay();
  const stop = new Date(to.getTime()).toEndOfDay();
  const result: Date[] = [];
  while (start.before(stop, 'date')) {
    result.push(new Date(start));
    start.toNextDay();
  }
  return result;
};

/**
 * Generate a calendar (array of Date objects) covering the full weeks of the current month.
 * @returns An array of Date objects.
 */
prototype.generateCalendar = function (this: Date): Date[] {
  const start = this.clone().toBeginOfMonth().toBeginOfWeek();
  const stop = this.clone().toEndOfMonth().toEndOfWeek();
  return start.generateDays(stop);
};

/**
 * Check if the date is the last day of the month.
 * @returns True if it is the end of the month.
 */
prototype.isEndOfMonth = function (this: Date): boolean {
  return new Date(this.getTime() + Date.DAY).getDate() === 1;
};

/**
 * Check if the date is the first day of the month.
 * @returns True if it is the beginning of the month.
 */
prototype.isBeginOfMonth = function (this: Date): boolean {
  return this.getDate() === 1;
};

/**
 * Check if the date is the beginning of the week.
 * @returns True if it is the beginning of the week.
 */
prototype.isBeginOfWeek = function (this: Date): boolean {
  return firstDayOfWeek === 1 ? this.getDay() === 1 : this.getDay() === 0;
};

/**
 * Check if the date is the end of the week.
 * @returns True if it is the end of the week.
 */
prototype.isEndOfWeek = function (this: Date): boolean {
  return firstDayOfWeek === 1 ? this.getDay() === 0 : this.getDay() === 6;
};

/**
 * Check if this date is before or equal to another date at the given granularity.
 * @param d - The date to compare with (default: now).
 * @param granularity - The level of truncation.
 * @returns True if this date is before or equal.
 */
prototype.beforeIncluding = function (this: Date, d?: Date, granularity: TDateGranularity = 'time'): boolean {
  d = d || new Date();
  return this.getTruncatedTime(granularity) <= d.getTruncatedTime(granularity);
};

/**
 * Check if this date is after or equal to another date at the given granularity.
 * @param d - The date to compare with (default: now).
 * @param granularity - The level of truncation.
 * @returns True if this date is after or equal.
 */
prototype.afterIncluding = function (this: Date, d?: Date, granularity: TDateGranularity = 'time'): boolean {
  d = d || new Date();
  return this.getTruncatedTime(granularity) >= d.getTruncatedTime(granularity);
};

/**
 * Check if the date is today.
 * @returns True if the date is today.
 */
prototype.isToday = function (this: Date): boolean {
  return this.same(new Date(), 'date');
};

/**
 * Check if the date is in the current week.
 * @returns True if it is this week.
 */
prototype.isThisWeek = function (this: Date): boolean {
  return this.isThisYear() && this.getWeekNumber() === new Date().getWeekNumber();
};

/**
 * Check if the date is in the next week.
 * @returns True if it is next week.
 */
prototype.isNextWeek = function (this: Date): boolean {
  return this.isThisYear() && this.getWeekNumber() === new Date().toNextWeek().getWeekNumber();
};

/**
 * Check if the date is in the previous week.
 * @returns True if it is the previous week.
 */
prototype.isPreviousWeek = function (this: Date): boolean {
  return this.isThisYear() && this.getWeekNumber() === new Date().toPreviousWeek().getWeekNumber();
};

/**
 * Get the difference in milliseconds between this date and another date (UTC based).
 * @param to - The other date.
 * @returns The difference in milliseconds.
 */
prototype.epochDifference = function (this: Date, to: Date): number {
  const utc1 = Date.UTC(
    this.getFullYear(),
    this.getMonth(),
    this.getDate(),
    this.getHours(),
    this.getMinutes(),
    this.getSeconds()
  );
  const utc2 = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate(), to.getHours(), to.getMinutes(), to.getSeconds());
  return utc2 - utc1;
};

/**
 * Get the difference in months between this date and another date.
 * @param d2 - The other date (default: now).
 * @returns The number of months difference.
 */
prototype.monthDifference = function (this: Date, d2: Date = new Date()): number {
  const d1Y = this.getFullYear();
  const d2Y = d2.getFullYear();
  const d1M = this.getMonth();
  const d2M = d2.getMonth();
  return (d2Y - d1Y) * 12 + (d2M - d1M);
};

/**
 * Get the difference in days between this date and another date.
 * @param d2 - The other date (default: now).
 * @returns The number of days difference.
 */
prototype.dayDifference = function (this: Date, d2: Date = new Date()): number {
  return Math.floor(Math.abs(d2.getTime() - this.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Get the French day index (0 = Monday, 6 = Sunday).
 * @returns The French day index.
 */
prototype.getFrenchDay = function (this: Date): number {
  let day = this.getDay() - 1;
  return day === -1 ? 6 : day;
};

/**
 * Convert the date to a different timezone.
 * @param offset - The target timezone offset in minutes.
 * @returns A new Date adjusted to the target timezone.
 */
prototype.toTimezone = function (this: Date, offset: number): Date {
  const diff = (offset - new Date().getTimezoneOffset()) * 60000;
  return new Date(this.getTime() - diff);
};

/**
 * Helper function to pad a number with a leading zero if needed.
 * @param num - The number to pad.
 * @returns A string with at least two digits.
 */
function padStart(num: number): string {
  const norm = Math.floor(Math.abs(num));
  return (norm < 10 ? '0' : '') + norm;
}

/**
 * Get a locale ISO string with timezone offset.
 * @returns The locale ISO string.
 */
prototype.toLocaleISOString = function (this: Date): string {
  return (
    this.getFullYear() +
    '-' +
    padStart(this.getMonth() + 1) +
    '-' +
    padStart(this.getDate()) +
    'T' +
    padStart(this.getHours()) +
    ':' +
    padStart(this.getMinutes()) +
    ':' +
    padStart(this.getSeconds()) +
    Date.offsetToISO(this.getTimezoneOffset())
  );
};

/**
 * Get the ISO date string (YYYY-MM-DD).
 * @returns The ISO date string.
 */
prototype.toISODateString = function (this: Date): string {
  return this.getFullYear() + '-' + padStart(this.getMonth() + 1) + '-' + padStart(this.getDate());
};

//------------------------------------------------------------------------------
// Polyfill for Date.now if not available
//------------------------------------------------------------------------------
if (!Date.now) {
  Date.now = function now() {
    return new Date().getTime();
  };
}

/**
 * Install the extensions on Date and Date.prototype.
 */
export function install(): void {
  monkeyPatchGet(Date, 'SECOND', { get: () => 1000 });
  monkeyPatchGet(Date, 'MINUTE', { get: () => 60000 });
  monkeyPatchGet(Date, 'HOUR', { get: () => 3600000 });
  monkeyPatchGet(Date, 'DAY', { get: () => 86400000 });

  // Patch static methods
  for (const name in object) {
    monkeyPatch(Date, name, object[name]!);
  }
  // Patch prototype methods
  for (const name in prototype) {
    monkeyPatch(Date.prototype, name, prototype[name]!);
  }
}

declare global {
  interface DateConstructor {
    /** Number of milliseconds in a second. */
    SECOND: number;
    /** Number of milliseconds in a minute. */
    MINUTE: number;
    /** Number of milliseconds in an hour. */
    HOUR: number;
    /** Number of milliseconds in a day. */
    DAY: number;
    /**
     * Set the first day of the week.
     * @param value - 0 for Sunday or 1 for Monday.
     */
    setFirstDayOfWeek(value: number): void;
    /**
     * Get the current first day of the week.
     * @returns The first day (0 for Sunday, 1 for Monday).
     */
    getFirstDayOfWeek(): number;
    /**
     * Get an array representing the week order based on the first day.
     * @returns An array of day indices (0-6).
     */
    getWeek(): number[];
    /**
     * Adjust a day index based on the first day of the week.
     * @param day - The original day index.
     * @returns The adjusted day index.
     */
    getDayIndex(day: number): number;
    /**
     * Get the first day of a given year.
     * @param year - The year.
     * @returns A Date representing January 1st.
     */
    beginOfYear(year: number): Date;
    /**
     * Get the last day of a given year.
     * @param year - The year.
     * @returns A Date representing December 31st.
     */
    endOfYear(year: number): Date;
    /**
     * Get a Date from an ISO week number and year.
     * @param week - The ISO week number.
     * @param year - The year.
     * @returns A Date representing the start of the ISO week.
     */
    fromWeekNumber(week: number, year: number): Date;
    /**
     * Create a Date from an epoch day.
     * @param eday - Number of days since Unix epoch.
     * @returns A Date corresponding to the epoch day.
     */
    fromEpochDay(eday: number): Date;
    /**
     * Get the current date and time.
     * @returns A new Date object representing now.
     */
    today(): Date;
    /**
     * Convert a timezone offset (in minutes) to an ISO formatted string.
     * @param offset - Timezone offset in minutes.
     * @returns An ISO formatted offset string.
     */
    offsetToISO(offset: number): string;
    /**
     * Create a Date from an ISO date string (YYYY-MM-DD).
     * @param s - The ISO date string.
     * @returns A Date object.
     */
    fromISODate(s: string): Date;
  }

  interface Date {
    /**
     * Truncate the date to the specified granularity.
     * @param granularity - The granularity level.
     * @returns The modified Date object.
     */
    truncate(granularity: TDateGranularity): Date;
    /**
     * Convert the date to a different timezone.
     * @param offset - The target timezone offset in minutes.
     * @returns A new Date adjusted to the target timezone.
     */
    toTimezone(offset: number): Date;
    /**
     * Get a locale ISO string with timezone offset.
     * @returns The locale ISO string.
     */
    toLocaleISOString(): string;
    /**
     * Check if the date is a weekend (Saturday or Sunday).
     * @returns True if weekend.
     */
    isWeekEnd(): boolean;
    /**
     * Get the adjusted day index based on the first day of the week.
     * @returns The adjusted day index (0-6).
     */
    getDayIndex(): number;
    /**
     * Get the truncated timestamp based on the given granularity.
     * @param granularity - The granularity level.
     * @returns The timestamp as a number.
     */
    getTruncatedTime(granularity?: TDateGranularity): number;
    /**
     * Get the number of epoch days since Unix epoch.
     * @returns The number of days.
     */
    getEpochDays(): number;
    /**
     * Set the date to the beginning of the week.
     * @returns The modified Date object.
     */
    toBeginOfWeek(): Date;
    /**
     * Set the date to the end of the week.
     * @returns The modified Date object.
     */
    toEndOfWeek(): Date;
    /**
     * Set the date to the end of the month.
     * @returns The modified Date object.
     */
    toEndOfMonth(): Date;
    /**
     * Set the date to the beginning of the month.
     * @returns The modified Date object.
     */
    toBeginOfMonth(): Date;
    /**
     * Set the time to the end of the day (23:59:59.999).
     * @returns The modified Date object.
     */
    toEndOfDay(): Date;
    /**
     * Set the time to the beginning of the day (00:00:00.000).
     * @returns The modified Date object.
     */
    toBeginOfDay(): Date;
    /**
     * Check if this date is before another date at the given granularity.
     * @param d - The date to compare with.
     * @param granularity - The granularity level.
     * @returns True if this date is before the other.
     */
    before(d?: Date, granularity?: TDateGranularity): boolean;
    /**
     * Check if this date is equal to another date at the given granularity.
     * @param d - The date to compare with.
     * @param granularity - The granularity level.
     * @returns True if both dates are equal.
     */
    same(d?: Date, granularity?: TDateGranularity): boolean;
    /**
     * Check if this date is after another date at the given granularity.
     * @param d - The date to compare with.
     * @param granularity - The granularity level.
     * @returns True if this date is after the other.
     */
    after(d?: Date, granularity?: TDateGranularity): boolean;
    /**
     * Get the ISO week number for this date.
     * @returns The ISO week number.
     */
    getWeekNumber(): number;
    /**
     * Add a specified number of milliseconds to the date.
     * @param value - Milliseconds to add.
     * @returns The modified Date object.
     */
    addTime(value: number): Date;
    /**
     * Add a specified number of seconds to the date.
     * @param value - Seconds to add.
     * @returns The modified Date object.
     */
    addSeconds(value: number): Date;
    /**
     * Add a specified number of minutes to the date.
     * @param value - Minutes to add.
     * @returns The modified Date object.
     */
    addMinutes(value: number): Date;
    /**
     * Add a specified number of hours to the date.
     * @param value - Hours to add.
     * @returns The modified Date object.
     */
    addHours(value: number): Date;
    /**
     * Add a specified number of days to the date.
     * @param value - Days to add.
     * @returns The modified Date object.
     */
    addDays(value: number): Date;
    /**
     * Add a specified number of months to the date.
     * @param value - Months to add.
     * @returns The modified Date object.
     */
    addMonths(value: number): Date;
    /**
     * Move to the next day.
     * @returns The modified Date object.
     */
    toNextDay(): Date;
    /**
     * Move to the next month.
     * @returns The modified Date object.
     */
    toNextMonth(): Date;
    /**
     * Move to the previous month.
     * @returns The modified Date object.
     */
    toPreviousMonth(): Date;
    /**
     * Move to the next week.
     * @returns The modified Date object.
     */
    toNextWeek(): Date;
    /**
     * Move to the previous week.
     * @returns The modified Date object.
     */
    toPreviousWeek(): Date;
    /**
     * Move to the next year.
     * @returns The modified Date object.
     */
    toNextYear(): Date;
    /**
     * Move to the previous year.
     * @returns The modified Date object.
     */
    toPreviousYear(): Date;
    /**
     * Clone the date.
     * @returns A new Date object with the same timestamp.
     */
    clone(): Date;
    /**
     * Check if the date is in the current month.
     * @returns True if this date is in the current month.
     */
    isThisMonth(): boolean;
    /**
     * Check if the date is in the next month.
     * @returns True if this date is in the next month.
     */
    isNextMonth(): boolean;
    /**
     * Check if the date is in the current year.
     * @returns True if this date is in the current year.
     */
    isThisYear(): boolean;
    /**
     * Generate an array of dates from this date to a target date.
     * @param to - The target date.
     * @returns An array of Date objects.
     */
    generateDays(to: Date): Date[];
    /**
     * Generate a calendar covering full weeks of the current month.
     * @returns An array of Date objects.
     */
    generateCalendar(): Date[];
    /**
     * Check if the date is the last day of the month.
     * @returns True if this is the end of the month.
     */
    isEndOfMonth(): boolean;
    /**
     * Check if the date is the first day of the month.
     * @returns True if this is the beginning of the month.
     */
    isBeginOfMonth(): boolean;
    /**
     * Check if the date is the beginning of the week.
     * @returns True if this is the beginning of the week.
     */
    isBeginOfWeek(): boolean;
    /**
     * Check if the date is the end of the week.
     * @returns True if this is the end of the week.
     */
    isEndOfWeek(): boolean;
    /**
     * Check if this date is before or equal to another date at the given granularity.
     * @param d - The date to compare with.
     * @param granularity - The granularity level.
     * @returns True if this date is before or equal.
     */
    beforeIncluding(d?: Date, granularity?: TDateGranularity): boolean;
    /**
     * Check if this date is after or equal to another date at the given granularity.
     * @param d - The date to compare with.
     * @param granularity - The granularity level.
     * @returns True if this date is after or equal.
     */
    afterIncluding(d?: Date, granularity?: TDateGranularity): boolean;
    /**
     * Check if the date is today.
     * @returns True if this date is today.
     */
    isToday(): boolean;
    /**
     * Check if the date is in the current week.
     * @returns True if this date is in the current week.
     */
    isThisWeek(): boolean;
    /**
     * Check if the date is in the next week.
     * @returns True if this date is in the next week.
     */
    isNextWeek(): boolean;
    /**
     * Check if the date is in the previous week.
     * @returns True if this date is in the previous week.
     */
    isPreviousWeek(): boolean;
    /**
     * Get the difference in milliseconds (UTC based) between this date and another date.
     * @param to - The other date.
     * @returns The difference in milliseconds.
     */
    epochDifference(to: Date): number;
    /**
     * Get the difference in months between this date and another date.
     * @param d2 - The other date.
     * @returns The number of months difference.
     */
    monthDifference(d2?: Date): number;
    /**
     * Add working days (skipping weekends) to the date.
     * @param value - Working days to add.
     * @returns The modified Date object.
     */
    addWorkingDays(value: number): Date;
    /**
     * Get the ISO date string (YYYY-MM-DD).
     * @returns The ISO date string.
     */
    toISODateString(): string;
    /**
     * Get the difference in days between this date and another date.
     * @param d2 - The other date.
     * @returns The number of days difference.
     */
    dayDifference(d2?: Date): number;
    /**
     * Get the French day index (0 = Monday, 6 = Sunday).
     * @returns The French day index.
     */
    getFrenchDay(): number;
  }
}
