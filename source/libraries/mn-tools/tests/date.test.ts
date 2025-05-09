import { expect } from '@jest/globals';
import { install } from '../library/patch/date';
import { formatDate } from '../library/date';
import { monkeyPatch } from '../library/objects';

install();

// -----------------------------------------------------------------------------------------
// Polyfill for Date.prototype.getWeekNumber for testing purposes
// This ensures that the '%W' format code returns a predictable value.
let originalGetWeekNumber: (() => number) | undefined;
beforeAll(() => {
  originalGetWeekNumber = Date.prototype.getWeekNumber;
  if (typeof Date.prototype.getWeekNumber !== 'function') {
    Date.prototype.getWeekNumber = function (): number {
      // For simplicity, return a fixed week number for testing
      return 42;
    };
  }
});

afterAll(() => {
  // Restore the original getWeekNumber function (if any)
  if (originalGetWeekNumber) monkeyPatch(Date.prototype, 'getWeekNumber', originalGetWeekNumber);
});

describe('formatDate', () => {
  // Existing tests for formatDate
  it('should format a Date object with default format', () => {
    const date = new Date(2021, 0, 1, 9, 5, 3); // Jan 1, 2021 09:05:03
    const formatted = formatDate(date);
    expect(formatted).toBe('01/01/2021 09:05');
  });

  it('should format a timestamp in seconds', () => {
    const date = new Date(2021, 0, 1, 9, 5, 3);
    const timestampInSeconds = Math.floor(date.getTime() / 1000);
    const formatted = formatDate(timestampInSeconds);
    expect(formatted).toBe('01/01/2021 09:05');
  });

  it('should format a timestamp in milliseconds', () => {
    const date = new Date(2021, 0, 1, 9, 5, 3);
    const timestampInMs = date.getTime();
    const formatted = formatDate(timestampInMs);
    expect(formatted).toBe('01/01/2021 09:05');
  });

  it('should format a date provided as a string', () => {
    const isoString = '2021-01-01T09:05:03';
    const formatted = formatDate(isoString);
    expect(formatted).toBe('01/01/2021 09:05');
  });

  it('should support custom format codes', () => {
    const date = new Date(2021, 0, 1, 9, 5, 3);
    const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    let offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    offset = Math.abs(offset);
    const tzHour = pad(Math.floor(offset / 60));
    const tzMin = pad(offset % 60);
    const tz = sign + tzHour + tzMin;
    const weekNumber = '53';
    const customFmt = '%d-%M-%Y %H:%m:%s %Z %W';
    const expected = `${day}-${month}-${year} ${hours}:${minutes}:${seconds} ${tz} ${weekNumber}`;
    const formatted = formatDate(date, customFmt);
    expect(formatted).toBe(expected);
  });

  it('should throw an error for unsupported format codes', () => {
    const date = new Date();
    expect(() => formatDate(date, '%X')).toThrow('Unsupported format code');
  });
});

//
// Additional tests for Date patch methods
//
describe('Static methods on Date', () => {
  it('should set and get the first day of the week', () => {
    Date.setFirstDayOfWeek(0);
    expect(Date.getFirstDayOfWeek()).toBe(0);
    Date.setFirstDayOfWeek(1);
    expect(Date.getFirstDayOfWeek()).toBe(1);
  });

  it('should return week array based on first day of week', () => {
    Date.setFirstDayOfWeek(0);
    expect(Date.getWeek()).toEqual([0, 1, 2, 3, 4, 5, 6]);
    Date.setFirstDayOfWeek(1);
    expect(Date.getWeek()).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });

  it('should adjust day index based on first day', () => {
    Date.setFirstDayOfWeek(1);
    expect(Date.getDayIndex(0)).toBe(6);
    Date.setFirstDayOfWeek(0);
    expect(Date.getDayIndex(0)).toBe(0);
  });

  it('should return beginning and end of year', () => {
    const begin = Date.beginOfYear(2021);
    expect(begin.getFullYear()).toBe(2021);
    expect(begin.getMonth()).toBe(0);
    expect(begin.getDate()).toBe(1);

    const end = Date.endOfYear(2021);
    expect(end.getFullYear()).toBe(2021);
    expect(end.getMonth()).toBe(11);
    expect(end.getDate()).toBe(31);
  });

  it('should return Date from week number', () => {
    // Using the polyfilled getWeekNumber, we check that a week calculated from the week number returns the expected week number.
    const d = Date.fromWeekNumber(1, 2021);
    expect(d.getWeekNumber()).toBe(1);
  });

  it('should create a Date from an epoch day', () => {
    const epochDays = new Date('2020-09-02').getEpochDays();
    const d = Date.fromEpochDay(epochDays);
    // Expected ISO date is "2020-09-02"
    const iso = d.toISOString().slice(0, 10);
    expect(iso).toBe('2020-09-02');
  });

  it('should return the current date from today()', () => {
    const now = new Date();
    const today = Date.today();
    // Check that the difference is minimal (within 1 second)
    expect(Math.abs(now.getTime() - today.getTime())).toBeLessThan(1000);
  });

  it('should convert a timezone offset to an ISO formatted string', () => {
    // For an offset of -120 minutes the expected ISO offset is "+02:00"
    const iso = Date.offsetToISO(-120);
    expect(iso).toBe('+02:00');
  });

  it('should create a Date from an ISO date string', () => {
    const d = Date.fromISODate('2021-12-25');
    expect(d.getFullYear()).toBe(2021);
    expect(d.getMonth()).toBe(11); // December
    expect(d.getDate()).toBe(25);
  });

  it('should have correct time constants', () => {
    expect(Date.SECOND).toBe(1000);
    expect(Date.MINUTE).toBe(60000);
    expect(Date.HOUR).toBe(3600000);
    expect(Date.DAY).toBe(86400000);
  });
});

describe('Prototype methods on Date (truncation, day adjustments, etc.)', () => {
  const baseDate = new Date(2021, 0, 1, 10, 20, 30, 400); // Jan 1, 2021 10:20:30.400

  it('should truncate date to time (default granularity)', () => {
    const d = new Date(baseDate);
    d.truncate('time');
    const expected = new Date(2021, 0, 1, 10, 20, 30, 0);
    expect(d.getTime()).toBe(expected.getTime());
  });

  it('should truncate date to minute', () => {
    const d = new Date(baseDate);
    d.truncate('minute');
    const expected = new Date(2021, 0, 1, 10, 20, 0, 0);
    expect(d.getTime()).toBe(expected.getTime());
  });

  it('should truncate date to hour', () => {
    const d = new Date(baseDate);
    d.truncate('hour');
    const expected = new Date(2021, 0, 1, 10, 0, 0, 0);
    expect(d.getTime()).toBe(expected.getTime());
  });

  it('should truncate date to date', () => {
    const d = new Date(baseDate);
    d.truncate('date');
    const expected = new Date(2021, 0, 1, 0, 0, 0, 0);
    expect(d.getTime()).toBe(expected.getTime());
  });

  it('should convert date to another timezone', () => {
    const d = new Date(2021, 5, 15, 12, 0, 0); // June 15, 2021 12:00:00 local time
    const targetTimezoneOffset = -120; // +02:00 in minutes
    const converted = d.toTimezone(targetTimezoneOffset);
    // Calculate expected time difference
    const diff = (targetTimezoneOffset - new Date().getTimezoneOffset()) * 60000;
    expect(converted.getTime()).toBe(d.getTime() - diff);
  });

  it('should return a valid locale ISO string with timezone offset', () => {
    const d = new Date(2021, 5, 15, 12, 30, 45);
    const isoStr = d.toLocaleISOString();
    // Regex: YYYY-MM-DDTHH:mm:ss(+|-)HH:mm
    expect(isoStr).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
  });

  it('should detect weekends correctly', () => {
    // Saturday
    const saturday = new Date(2021, 7, 7);
    expect(saturday.isWeekEnd()).toBe(true);
    // Wednesday
    const wednesday = new Date(2021, 7, 4);
    expect(wednesday.isWeekEnd()).toBe(false);
  });

  it('should return adjusted day index based on first day of week (prototype)', () => {
    Date.setFirstDayOfWeek(1);
    let d = new Date(2021, 0, 3); // Sunday
    expect(d.getDayIndex()).toBe(6);
    Date.setFirstDayOfWeek(0);
    d = new Date(2021, 0, 3);
    expect(d.getDayIndex()).toBe(0);
  });

  it('should return the number of epoch days', () => {
    const d = new Date(1970, 0, 2);
    expect(d.getEpochDays()).toBe(1);
  });

  it('should set date to beginning of week', () => {
    Date.setFirstDayOfWeek(1);
    const d = new Date(2021, 8, 15); // Wednesday, Sept 15, 2021
    d.toBeginOfWeek();
    expect(d.getDay()).toBe(1); // Monday
  });

  it('should set date to end of week', () => {
    Date.setFirstDayOfWeek(1);
    const d = new Date(2021, 8, 15); // Wednesday, Sept 15, 2021
    d.toEndOfWeek();
    expect(d.getDay()).toBe(0); // Sunday when first day is Monday
    // Also check that time is set to end of day
    expect(d.getHours()).toBe(23);
    expect(d.getMinutes()).toBe(59);
    expect(d.getSeconds()).toBe(59);
  });

  it('should set date to beginning and end of month', () => {
    const dBegin = new Date(2021, 8, 15); // Sept 15, 2021
    dBegin.toBeginOfMonth();
    expect(dBegin.getDate()).toBe(1);

    const dEnd = new Date(2021, 8, 15); // Sept 15, 2021
    dEnd.toEndOfMonth();
    // Next day should be the 1st of next month
    const nextDay = new Date(dEnd.getTime() + Date.DAY);
    expect(nextDay.getDate()).toBe(1);
  });

  it('should set time to beginning and end of day', () => {
    const d1 = new Date(2021, 0, 1, 12, 34, 56, 789);
    d1.toBeginOfDay();
    expect(d1.getHours()).toBe(0);
    expect(d1.getMinutes()).toBe(0);
    expect(d1.getSeconds()).toBe(0);
    expect(d1.getMilliseconds()).toBe(0);

    const d2 = new Date(2021, 0, 1, 12, 34, 56, 789);
    d2.toEndOfDay();
    expect(d2.getHours()).toBe(23);
    expect(d2.getMinutes()).toBe(59);
    expect(d2.getSeconds()).toBe(59);
    expect(d2.getMilliseconds()).toBe(999);
  });

  it('should compare dates using before, same and after', () => {
    const d1 = new Date(2021, 0, 1, 10, 0, 0);
    const d2 = new Date(2021, 0, 1, 11, 0, 0);
    expect(d1.before(d2, 'hour')).toBe(true);
    expect(d1.same(d1, 'minute')).toBe(true);
    expect(d2.after(d1, 'minute')).toBe(true);
  });

  it('should return correct ISO week number', () => {
    // Using a known date for ISO week number calculation
    const d = new Date(2021, 0, 4); // Jan 4, 2021 is a Monday, week 1 in ISO-8601
    expect(d.getWeekNumber()).toBe(1);
  });

  it('should add time correctly', () => {
    const d = new Date(2021, 0, 1, 10, 0, 0);
    d.addTime(Date.MINUTE); // add 1 minute
    expect(d.getMinutes()).toBe(1);
  });

  it('should add seconds, minutes, hours, days, months correctly', () => {
    const d = new Date(2021, 0, 1, 10, 0, 0);
    d.addSeconds(30);
    expect(d.getSeconds()).toBe(30);
    d.addMinutes(15);
    expect(d.getMinutes()).toBe(15);
    d.addHours(2);
    expect(d.getHours()).toBe(12);
    d.addDays(1);
    expect(d.getDate()).toBe(2);
    d.addMonths(1);
    expect(d.getMonth()).toBe(1); // February
  });

  it('should move to next/previous day, week, month and year correctly', () => {
    const d = new Date(2021, 0, 15);
    const nextDay = d.clone().toNextDay();
    expect(nextDay.getDate()).toBe(16);

    const nextWeek = d.clone().toNextWeek();
    expect(nextWeek.getDate()).toBe(22);

    const prevWeek = d.clone().toPreviousWeek();
    expect(prevWeek.getDate()).toBe(8);

    const nextMonth = d.clone().toNextMonth();
    expect(nextMonth.getMonth()).toBe(1);

    const prevMonth = d.clone().toPreviousMonth();
    expect(prevMonth.getMonth()).toBe(11); // December of previous year if day overflows
    const nextYear = d.clone().toNextYear();
    expect(nextYear.getFullYear()).toBe(2022);
    const prevYear = d.clone().toPreviousYear();
    expect(prevYear.getFullYear()).toBe(2020);
  });

  it('should clone the date correctly', () => {
    const d = new Date();
    const clone = d.clone();
    expect(clone.getTime()).toBe(d.getTime());
    expect(clone).not.toBe(d);
  });

  it('should detect current, next month and current year', () => {
    const now = new Date();
    const d = new Date(now);
    expect(d.isThisMonth()).toBe(true);
    const nextMonth = now.clone().toNextMonth();
    expect(nextMonth.isNextMonth()).toBe(true);
    expect(d.isThisYear()).toBe(true);
  });

  it('should generate days between two dates', () => {
    const start = new Date(2021, 0, 1);
    const end = new Date(2021, 0, 5);
    const days = start.generateDays(end);
    // Expect days from Jan 1 to Jan 4 (since Jan 5 is end day exclusive based on toBeginOfDay/toEndOfDay)
    expect(days.length).toBe(4);
    expect(days[0]?.getDate()).toBe(1);
    expect(days[days.length - 1]?.getDate()).toBe(4);
  });

  it('should generate a calendar covering full weeks of the month', () => {
    const d = new Date(2021, 8, 15); // September 2021
    const cal = d.generateCalendar();
    // Calendar array should include dates before the 1st and after the end of the month to cover full weeks
    expect(cal.length).toBeGreaterThanOrEqual(28);
  });

  it('should detect beginning/end of month', () => {
    const begin = new Date(2021, 0, 1);
    expect(begin.isBeginOfMonth()).toBe(true);
    const end = new Date(2021, 0, 31);
    expect(end.isEndOfMonth()).toBe(true);
  });

  it('should detect beginning and end of week', () => {
    Date.setFirstDayOfWeek(1);
    const monday = new Date(2021, 8, 13); // Monday
    expect(monday.isBeginOfWeek()).toBe(true);
    const sunday = new Date(2021, 8, 19); // Sunday
    expect(sunday.isEndOfWeek()).toBe(true);
  });

  it('should compare dates including equality with beforeIncluding and afterIncluding', () => {
    const d1 = new Date(2021, 0, 1, 10, 0, 0);
    const d2 = new Date(2021, 0, 1, 10, 0, 0);
    expect(d1.beforeIncluding(d2)).toBe(true);
    expect(d1.afterIncluding(d2)).toBe(true);
  });

  it('should detect if a date is today', () => {
    const d = new Date();
    expect(d.isToday()).toBe(true);
  });

  it('should detect if date is in this, next and previous week', () => {
    // Using current date for this week and adjusting for previous/next weeks
    const today = new Date();
    expect(today.isThisWeek()).toBe(true);
    const nextWeek = today.clone().toNextWeek();
    expect(nextWeek.isNextWeek()).toBe(true);
    const prevWeek = today.clone().toPreviousWeek();
    expect(prevWeek.isPreviousWeek()).toBe(true);
  });

  it('should compute epoch, month and day differences correctly', () => {
    const d1 = new Date(2021, 0, 1, 0, 0, 0);
    const d2 = new Date(2021, 0, 2, 0, 0, 0);
    // Epoch difference in ms
    expect(d1.epochDifference(d2)).toBe(Date.DAY);
    // Month difference
    const d3 = new Date(2021, 0, 1);
    const d4 = new Date(2021, 2, 1); // March 1, 2021
    expect(d3.monthDifference(d4)).toBe(2);
    // Day difference
    expect(d1.dayDifference(d2)).toBe(1);
  });

  it('should return the French day index correctly', () => {
    // For a Tuesday, getFrenchDay() should return 1 (0 = Monday)
    const tuesday = new Date(2021, 7, 10);
    expect(tuesday.getFrenchDay()).toBe(1);
    // For a Sunday, getFrenchDay() should return 6
    const sunday = new Date(2021, 7, 8);
    expect(sunday.getFrenchDay()).toBe(6);
  });

  it('should return a valid ISO date string (YYYY-MM-DD)', () => {
    const d = new Date(2021, 11, 25);
    expect(d.toISODateString()).toBe('2021-12-25');
  });

  it('should add working days skipping weekends', () => {
    // Starting on a Friday, adding 1 working day should go to Monday
    const friday = new Date(2021, 8, 3); // Assume Sept 3, 2021 is a Friday
    const nextWorking = friday.clone().addWorkingDays(1);
    // Depending on the implementation, the day should be Monday (6 -> 1 conversion)
    expect(nextWorking.getDay()).toBe(1);
  });
});
