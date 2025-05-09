import { createRef } from 'react';
import { integer, isDefined } from 'mn-tools';
import { TJSXElementChildren } from '../../../system';
import { TDidUpdateSnapshot } from '../../containable';
import { Container, IContainerProps, IContainerState } from '../../container';
import { Typography } from '../../typography';

export interface IWeekInputProps extends IContainerProps {
  defaultValue?: Date;
  yearRange?: [number, number];
  canReset?: boolean;
  onChange?: (value: Date | undefined) => void | Promise<void>;
}

interface IWeekInputState extends IContainerState {
  week: string;
  year: string;
  activeSection: 'week' | 'year';
}

export class WeekInput extends Container<IWeekInputProps, IWeekInputState> {
  private inputRef = createRef<HTMLInputElement>();

  public static override get defaultProps(): IWeekInputProps {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      verticalItemAlignment: 'middle',
      canReset: true,
    };
  }

  public constructor(props: IWeekInputProps) {
    super(props);
    const { defaultValue } = props;
    const week = defaultValue?.getWeekNumber();
    const year = defaultValue?.getFullYear();
    this.state = {
      ...this.state,
      week: isDefined(week) ? String(week).padStart(2, '0') : '',
      year: isDefined(year) ? String(year) : '',
      activeSection: 'week',
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IWeekInputProps>,
    prevState: Readonly<IWeekInputState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (this.props === prevProps) return;
    const weekNumber = this.props.defaultValue?.getWeekNumber();
    const week = isDefined(weekNumber) ? String(weekNumber).padStart(2, '0') : '';
    const yearNumber = this.props.defaultValue?.getFullYear();
    const year = isDefined(yearNumber) ? String(yearNumber) : '';
    if (week !== this.state.week || year !== this.state.year) {
      this.setState({ week, year });
    }
  }

  private async onChange() {
    if (!this.props.onChange) return;
    let { week, year } = this.state;
    if (week.length === 2 && year.length === 4) {
      const weekNumber = integer(week);
      const yearNumber = integer(year);
      if (weekNumber >= 1 && weekNumber <= 52) {
        const date = this.getDateFromWeekYear(weekNumber, yearNumber);
        await this.props.onChange(date);
      }
    }
  }

  private getDateFromWeekYear(week: number, year: number): Date {
    const date = new Date(year, 0, 1 + (week - 1) * 7);
    const dateDay = date.getDay();
    const day = dateDay === 0 ? 7 : dateDay;
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  private async onFocusOut() {
    const { week, year } = this.state;
    const correction = this.correctWeekAndYear(week, year);
    await this.setStateAsync({ week: correction.week, year: correction.year });
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

    let activeSection: 'week' | 'year' = 'week';
    if (selectionStart >= 0 && selectionStart <= 2) {
      activeSection = 'week';
    } else if (selectionStart >= 3 && selectionStart <= 7) {
      activeSection = 'year';
    }

    await this.setStateAsync({ activeSection });
  }

  private async onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const { key } = e;
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      e.preventDefault();
      await this.moveSection(key === 'ArrowLeft' ? -1 : 1);
    } else if (key === 'Backspace' && this.props.canReset) {
      e.preventDefault();
      await this.setStateAsync({ week: '', year: '', activeSection: 'week' });
      if (this.props.onChange) await this.props.onChange(undefined);
    } else if (/^\d$/.test(key)) {
      e.preventDefault();
      await this.handleDigitInput(key);
    }
  }

  private async handleDigitInput(digit: string) {
    let { activeSection, week, year } = this.state;
    let doCorrectDate = false;

    switch (activeSection) {
      case 'week': {
        if (week.length === 0 || week.length === 2) {
          week = digit;
        } else {
          week += digit;
          if (integer(week) > 52) week = '0' + digit;
        }
        if (week.length === 2) {
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
      const correction = this.correctWeekAndYear(week, year);
      week = correction.week;
      year = correction.year;
    }

    await this.setStateAsync({ activeSection, week, year });
    this.setSelectionRange();
    await this.onChange();
  }

  private correctWeekAndYear(week: string, year: string) {
    if (!week || !year) return { week, year };
    const weekNumber = Math.min(52, Math.max(1, integer(week)));
    const yearNumber = Math.max(
      this.props.yearRange ? this.props.yearRange[0] : 1900,
      Math.min(this.props.yearRange ? this.props.yearRange[1] : 2100, integer(year))
    );
    week = String(weekNumber).padStart(2, '0');
    year = String(yearNumber).padEnd(4, '0');
    return { week, year };
  }

  private async moveSection(direction: number) {
    const sections = ['week', 'year'] as const;
    let { activeSection, week, year } = this.state;
    const correction = this.correctWeekAndYear(week, year);
    week = correction.week;
    year = correction.year;

    const currentIndex = sections.indexOf(activeSection);
    let newIndex = currentIndex + direction;

    if (newIndex < 0) newIndex = 0;
    if (newIndex > sections.length - 1) newIndex = sections.length - 1;

    await this.setStateAsync({ activeSection: sections[newIndex]!, week, year });
    this.setSelectionRange();
    await await this.onChange();
  }

  private setSelectionRange() {
    requestAnimationFrame(() => {
      const input = this.inputRef.current;
      if (!input) return;

      const { activeSection } = this.state;
      switch (activeSection) {
        case 'week':
          input.setSelectionRange(0, 2);
          break;
        case 'year':
          input.setSelectionRange(3, 7);
          break;
      }
    });
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-week-input'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    const { week, year } = this.state;
    let value = '';
    if (week || year) {
      value = `${week.padStart(2, '0')}/${year.padEnd(4, '0')}`;
    }
    return [
      <Typography key='label' variant='document' contentType='text' content='Semaine' />,
      <input
        key='week-input'
        ref={this.inputRef}
        type='text'
        value={value}
        placeholder='SS/AAAA'
        onFocus={(e) => app.$errorManager.handlePromise(this.onFocusIn(e))}
        onBlur={() => app.$errorManager.handlePromise(this.onFocusOut())}
        onClick={(e) => app.$errorManager.handlePromise(this.onTap(e))}
        onKeyDown={(e) => app.$errorManager.handlePromise(this.onKeyDown(e))}
        onChange={() => {}}
      />,
    ];
  }
}
