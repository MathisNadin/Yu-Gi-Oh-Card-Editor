import { createRef } from 'react';
import { integer } from 'mn-tools';
import { TJSXElementChildren } from '../../../system';
import { IContainableProps, Containable, IContainableState, TDidUpdateSnapshot } from '../../containable';

export interface IDateTimeInputProps extends IContainableProps {
  defaultValue?: Date;
  yearRange?: [number, number];
  canReset?: boolean;
  onChange?: (value: Date | undefined) => void | Promise<void>;
}

interface IDateTimeInputState extends IContainableState {
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
  activeSection: 'day' | 'month' | 'year' | 'hour' | 'minute';
  dateTime?: Date;
}

export class DateTimeInput extends Containable<IDateTimeInputProps, IDateTimeInputState> {
  private inputRef = createRef<HTMLInputElement>();

  public static override get defaultProps(): IDateTimeInputProps {
    return {
      ...super.defaultProps,
      canReset: true,
    };
  }

  public constructor(props: IDateTimeInputProps) {
    super(props);
    const { defaultValue } = props;
    this.state = {
      ...this.state,
      day: defaultValue ? String(defaultValue.getDate()).padStart(2, '0') : '',
      month: defaultValue ? String(defaultValue.getMonth() + 1).padStart(2, '0') : '',
      year: defaultValue ? String(defaultValue.getFullYear()) : '',
      hour: defaultValue ? String(defaultValue.getHours()).padStart(2, '0') : '',
      minute: defaultValue ? String(defaultValue.getMinutes()).padStart(2, '0') : '',
      activeSection: 'day',
      dateTime: defaultValue,
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IDateTimeInputProps>,
    prevState: Readonly<IDateTimeInputState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (this.props.defaultValue?.getTime() !== this.state.dateTime?.getTime()) {
      const { defaultValue } = this.props;
      this.setState({
        day: defaultValue ? String(defaultValue.getDate()).padStart(2, '0') : '',
        month: defaultValue ? String(defaultValue.getMonth() + 1).padStart(2, '0') : '',
        year: defaultValue ? String(defaultValue.getFullYear()) : '',
        hour: defaultValue ? String(defaultValue.getHours()).padStart(2, '0') : '',
        minute: defaultValue ? String(defaultValue.getMinutes()).padStart(2, '0') : '',
        dateTime: defaultValue,
      });
    }
  }

  private async onChange() {
    if (!this.props.onChange) return;
    let { day, month, year, hour, minute, dateTime: oldDateTime } = this.state;
    if (day.length === 2 && month.length === 2 && year.length === 4 && hour.length === 2 && minute.length === 2) {
      const dateTime = oldDateTime ? new Date(oldDateTime) : new Date().toBeginOfDay();
      dateTime.setFullYear(integer(year));
      dateTime.setMonth(integer(month) - 1);
      dateTime.setDate(integer(day));
      dateTime.setHours(integer(hour));
      dateTime.setMinutes(integer(minute));
      await this.setStateAsync({ dateTime });
      this.props.onChange(dateTime);
    }
  }

  private async onFocusOut() {
    const { day, month, year, hour, minute } = this.state;
    const correction = this.correctDateTime(day, month, year, hour, minute);
    await this.setStateAsync({
      day: correction.day,
      month: correction.month,
      year: correction.year,
      hour: correction.hour,
      minute: correction.minute,
    });
    await this.onChange();
  }

  private async onFocusIn(event: React.FocusEvent<HTMLInputElement>) {
    await this.updateActiveSection(event.target.selectionStart);
    this.setSelectionRange();
  }

  private async onTap(event: React.MouseEvent<HTMLInputElement>) {
    await this.updateActiveSection(event.currentTarget.selectionStart);
    this.setSelectionRange();
  }

  private async updateActiveSection(selectionStart: number | null) {
    if (selectionStart === null) return;

    let activeSection: 'day' | 'month' | 'year' | 'hour' | 'minute' = 'day';
    if (selectionStart >= 0 && selectionStart <= 2) {
      activeSection = 'day';
    } else if (selectionStart >= 3 && selectionStart <= 5) {
      activeSection = 'month';
    } else if (selectionStart >= 6 && selectionStart <= 10) {
      activeSection = 'year';
    } else if (selectionStart >= 11 && selectionStart <= 13) {
      activeSection = 'hour';
    } else if (selectionStart >= 14 && selectionStart <= 16) {
      activeSection = 'minute';
    }

    await this.setStateAsync({ activeSection });
  }

  private async onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const { key } = e;
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      e.preventDefault();
      this.moveSection(key === 'ArrowLeft' ? -1 : 1);
    } else if (key === 'Backspace' && this.props.canReset) {
      e.preventDefault();
      await this.setStateAsync({
        dateTime: undefined,
        activeSection: 'day',
        day: '',
        month: '',
        year: '',
        hour: '',
        minute: '',
      });
      if (this.props.onChange) await this.props.onChange(undefined);
    } else if (/^\d$/.test(key)) {
      e.preventDefault();
      this.handleDigitInput(key);
    }
  }

  private async handleDigitInput(digit: string) {
    let { activeSection, day, month, year, hour, minute } = this.state;
    let doCorrectDateTime = false;

    switch (activeSection) {
      case 'day': {
        if (day.length === 0 || day.length === 2) {
          day = digit;
        } else {
          day += digit;
          if (integer(day) > 31) day = '0' + digit;
        }
        if (day.length === 2) {
          activeSection = 'month';
          doCorrectDateTime = true;
        }
        break;
      }

      case 'month': {
        if (month.length === 0 || month.length === 2) {
          month = digit;
        } else {
          month += digit;
          if (integer(month) > 12) month = '0' + digit;
        }
        if (month.length === 2) {
          activeSection = 'year';
          doCorrectDateTime = true;
        }
        break;
      }

      case 'year': {
        if (year.length === 0 || year.length === 4) {
          year = digit;
        } else {
          year += digit;
        }
        if (year.length === 4) {
          activeSection = 'hour';
          doCorrectDateTime = true;
        }
        break;
      }

      case 'hour': {
        if (hour.length === 0 || hour.length === 2) {
          hour = digit;
        } else {
          hour += digit;
          if (integer(hour) > 23) hour = '0' + digit;
        }
        if (hour.length === 2) {
          activeSection = 'minute';
          doCorrectDateTime = true;
        }
        break;
      }

      case 'minute': {
        if (minute.length === 0 || minute.length === 2) {
          minute = digit;
        } else {
          minute += digit;
          if (integer(minute) > 59) minute = '0' + digit;
        }
        break;
      }
    }

    if (doCorrectDateTime) {
      const correction = this.correctDateTime(day, month, year, hour, minute);
      day = correction.day;
      month = correction.month;
      year = correction.year;
      hour = correction.hour;
      minute = correction.minute;
    }

    await this.setStateAsync({ activeSection, day, month, year, hour, minute });
    this.setSelectionRange();
    await this.onChange();
  }

  private correctDateTime(day: string, month: string, year: string, hour: string, minute: string) {
    if (!day || !month || !year || !hour || !minute) return { day, month, year, hour, minute };
    if (day === '00') day = '01';
    if (month === '00') month = '01';
    const correctDateTime = new Date(
      `${year.padEnd(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour}:${minute}`
    );
    day = String(correctDateTime.getDate()).padStart(2, '0');
    month = String(correctDateTime.getMonth() + 1).padStart(2, '0');
    year = String(correctDateTime.getFullYear()).padEnd(4, '0');
    hour = String(correctDateTime.getHours()).padStart(2, '0');
    minute = String(correctDateTime.getMinutes()).padStart(2, '0');
    return { day, month, year, hour, minute };
  }

  private async moveSection(direction: number) {
    const sections = ['day', 'month', 'year', 'hour', 'minute'] as const;
    let { activeSection, day, month, year, hour, minute } = this.state;
    const correction = this.correctDateTime(day, month, year, hour, minute);
    day = correction.day;
    month = correction.month;
    year = correction.year;
    hour = correction.hour;
    minute = correction.minute;

    const currentIndex = sections.indexOf(activeSection);
    let newIndex = currentIndex + direction;

    if (newIndex < 0) newIndex = 0;
    if (newIndex > sections.length - 1) newIndex = sections.length - 1;

    await this.setStateAsync({ activeSection: sections[newIndex]!, day, month, year, hour, minute });
    this.setSelectionRange();
    await this.onChange();
  }

  private setSelectionRange() {
    requestAnimationFrame(() => {
      const input = this.inputRef.current;
      if (!input) return;

      const { activeSection } = this.state;
      switch (activeSection) {
        case 'day':
          input.setSelectionRange(0, 2);
          break;
        case 'month':
          input.setSelectionRange(3, 5);
          break;
        case 'year':
          input.setSelectionRange(6, 10);
          break;
        case 'hour':
          input.setSelectionRange(11, 13);
          break;
        case 'minute':
          input.setSelectionRange(14, 16);
          break;
      }
    });
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-date-time-input'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    const { day, month, year, hour, minute } = this.state;
    let value = '';
    if (day || month || year || hour || minute) {
      value = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year.padEnd(4, '0')} ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    }
    return [
      <input
        ref={this.inputRef}
        key='date-time-input'
        type='text'
        value={value}
        placeholder='JJ/MM/AAAA HH:MM'
        onFocus={(e) => app.$errorManager.handlePromise(this.onFocusIn(e))}
        onBlur={() => app.$errorManager.handlePromise(this.onFocusOut())}
        onClick={(e) => app.$errorManager.handlePromise(this.onTap(e))}
        onKeyDown={(e) => app.$errorManager.handlePromise(this.onKeyDown(e))}
        onChange={() => {}}
      />,
    ];
  }
}
