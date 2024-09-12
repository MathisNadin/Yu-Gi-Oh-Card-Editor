export * from './DatePicker';
export * from './DatePickerField';
export * from './TimePicker';
export * from './TimePickerField';
export * from './DateTimePicker';
export * from './DateTimePickerField';
export * from './DateRangePicker';
export * from './DateRangePickerField';
export * from './DateTimeRangePicker';
export * from './DateTimeRangePickerField';
export * from './WeekPicker';
export * from './WeekPickerField';
export * from './WeekRangePicker';
export * from './WeekRangePickerField';
export * from './DateTimePickerService';

export { DateChooser as SmallCalendar } from './choosers';

import { DateTimePickerService } from './DateTimePickerService';

declare global {
  interface IApp {
    $dateTimePicker: DateTimePickerService;
  }
}
