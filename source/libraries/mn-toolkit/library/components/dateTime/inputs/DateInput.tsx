import { createRef } from 'react';
import { integer } from 'mn-tools';
import { TJSXElementChildren } from '../../../system';
import { IContainableProps, Containable, IContainableState, TDidUpdateSnapshot } from '../../containable';

export interface IDateInputProps extends IContainableProps {
  yearRange?: [number, number];
  canReset: boolean;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void | Promise<void>;
}

interface IDateInputState extends IContainableState {
  day: string;
  month: string;
  year: string;
  activeSection: 'day' | 'month' | 'year';
}

export class DateInput extends Containable<IDateInputProps, IDateInputState> {
  private inputRef = createRef<HTMLInputElement>();

  public static override get defaultProps(): Omit<IDateInputProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      canReset: true,
    };
  }

  public constructor(props: IDateInputProps) {
    super(props);
    this.state = {
      ...this.state,
      day: props.value ? String(props.value.getDate()).padStart(2, '0') : '',
      month: props.value ? String(props.value.getMonth() + 1).padStart(2, '0') : '',
      year: props.value ? String(props.value.getFullYear()) : '',
      activeSection: 'day',
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IDateInputProps>,
    prevState: Readonly<IDateInputState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps.value?.getTime() !== this.props.value?.getTime()) {
      this.setState({
        day: this.props.value ? String(this.props.value.getDate()).padStart(2, '0') : '',
        month: this.props.value ? String(this.props.value.getMonth() + 1).padStart(2, '0') : '',
        year: this.props.value ? String(this.props.value.getFullYear()) : '',
      });
    }
  }

  private async onChange() {
    let { day, month, year } = this.state;
    if (day.length === 2 && month.length === 2 && year.length === 4) {
      const date = new Date(`${year}-${month}-${day}`);
      await this.props.onChange(isNaN(date.getTime()) ? undefined : date);
    }
  }

  private async onFocusOut() {
    const { day, month, year } = this.state;
    const correction = this.correctDate(day, month, year);
    await this.setStateAsync({ day: correction.day, month: correction.month, year: correction.year });
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

    let activeSection: 'day' | 'month' | 'year' = 'day';
    if (selectionStart >= 0 && selectionStart <= 2) {
      activeSection = 'day';
    } else if (selectionStart >= 3 && selectionStart <= 5) {
      activeSection = 'month';
    } else if (selectionStart >= 6 && selectionStart <= 10) {
      activeSection = 'year';
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
      await this.setStateAsync({ activeSection: 'day', day: '', month: '', year: '' });
      await this.props.onChange(undefined);
    } else if (/^\d$/.test(key)) {
      e.preventDefault();
      this.handleDigitInput(key);
    }
  }

  private async handleDigitInput(digit: string) {
    let { activeSection, day, month, year } = this.state;
    let doCorrectDate = false;

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
          doCorrectDate = true;
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
          doCorrectDate = true;
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
          doCorrectDate = true;
        }
        break;
      }
    }

    if (doCorrectDate) {
      const correction = this.correctDate(day, month, year);
      day = correction.day;
      month = correction.month;
      year = correction.year;
    }

    await this.setStateAsync({ activeSection, day, month, year });
    this.setSelectionRange();
    await this.onChange();
  }

  private correctDate(day: string, month: string, year: string) {
    if (!day || !month || !year) return { day, month, year };
    if (day === '00') day = '01';
    if (month === '00') month = '01';
    const correctDate = new Date(`${year.padEnd(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    day = String(correctDate.getDate()).padStart(2, '0');
    month = String(correctDate.getMonth() + 1).padStart(2, '0');
    year = String(correctDate.getFullYear()).padEnd(4, '0');
    return { day, month, year };
  }

  private async moveSection(direction: number) {
    const sections = ['day', 'month', 'year'] as const;
    let { activeSection, day, month, year } = this.state;
    const correction = this.correctDate(day, month, year);
    day = correction.day;
    month = correction.month;
    year = correction.year;

    const currentIndex = sections.indexOf(activeSection);
    let newIndex = currentIndex + direction;

    if (newIndex < 0) newIndex = 0;
    if (newIndex > sections.length - 1) newIndex = sections.length - 1;

    await this.setStateAsync({ activeSection: sections[newIndex]!, day, month, year });
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
      }
    });
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-date-input'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    const { day, month, year } = this.state;
    let value = '';
    if (day || month || year) {
      value = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year.padEnd(4, '0')}`;
    }
    return [
      <input
        ref={this.inputRef}
        key='date-input'
        type='text'
        placeholder='JJ/MM/AAAA'
        value={value}
        onChange={() => {}} // Not used here but necessary for React
        onFocus={(e) => app.$errorManager.handlePromise(this.onFocusIn(e))}
        onBlur={() => app.$errorManager.handlePromise(this.onFocusOut())}
        onClick={(e) => app.$errorManager.handlePromise(this.onTap(e))}
        onKeyDown={(e) => app.$errorManager.handlePromise(this.onKeyDown(e))}
      />,
    ];
  }
}
