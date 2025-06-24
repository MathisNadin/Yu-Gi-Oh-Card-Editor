import { classNames, isDefined } from 'mn-tools';
import { TJSXElementChild, TJSXElementChildren } from '../../../system';
import { IContainerProps, Container, IContainerState, HorizontalStack, VerticalStack, Grid } from '../../container';
import { Spacer } from '../../spacer';
import { Typography } from '../../typography';
import { Icon } from '../../icon';

export type TWeekChooserChangeSource = 'week' | 'month' | 'year';

export interface IWeekChooserProps extends IContainerProps {
  yearRange?: [number, number];
  value: Date;
  onChange: (value: Date, source: TWeekChooserChangeSource) => void | Promise<void>;
}

interface IWeekChooserState extends IContainerState {
  display: 'calendar' | 'years';
  height: string;
}

export class WeekChooser extends Container<IWeekChooserProps, IWeekChooserState> {
  public static override get defaultProps(): Omit<IWeekChooserProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      gutter: true,
      maxWidth: '100%',
      maxHeight: '100%',
      yearRange: [1900, 2100],
    };
  }

  public constructor(props: IWeekChooserProps) {
    super(props);
    this.state = {
      ...this.state,
      display: 'calendar',
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    if (!this.base.current?.clientHeight) return;
    this.setState({ height: `${this.base.current.clientHeight}px` });
  }

  private async onSwitchDisplay() {
    if (this.state.display === 'years') {
      await this.setStateAsync({ display: 'calendar' });
    } else {
      await this.setStateAsync({ display: 'years' });
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!this.base.current) return;

          const yearsGrid = this.base.current.querySelector('.years');
          if (!yearsGrid) return;

          const selectedYearElement = yearsGrid.querySelector('.year.selected');
          if (!selectedYearElement) return;

          yearsGrid.scrollTo({
            top: selectedYearElement.getBoundingClientRect().top - yearsGrid.getBoundingClientRect().top,
            behavior: 'instant',
          });
        })
      );
    }
  }

  private async onChangeYear(year: number) {
    const date = new Date(this.props.value);
    date.setFullYear(year);

    const lastDayOfNewMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    if (date.getDate() > lastDayOfNewMonth) {
      date.setDate(lastDayOfNewMonth);
    }

    this.setState({ display: 'calendar' });
    await this.props.onChange(date, 'year');
  }

  private async onChangeMonth(offset: number) {
    const date = new Date(this.props.value);
    date.setMonth(date.getMonth() + offset);

    const lastDayOfNewMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    if (date.getDate() > lastDayOfNewMonth) {
      date.setDate(lastDayOfNewMonth);
    }

    await this.props.onChange(date, 'month');
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-week-chooser'] = true;
    return classes;
  }

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    if (isDefined(this.state.height)) {
      attributes.style = { ...attributes.style, height: this.state.height };
    }
    return attributes;
  }

  public override get children(): TJSXElementChildren {
    const yearRange = this.props.yearRange!;
    const month = this.props.value.getMonth();
    const year = this.props.value.getFullYear();

    const firstDayOfMonth = (new Date(year, month, 1).getDay() - Date.getFirstDayOfWeek() + 7) % 7;
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const daysFromPrevMonth =
      firstDayOfMonth > 0
        ? Array.from({ length: firstDayOfMonth }, (_, i) => daysInPrevMonth - firstDayOfMonth + i + 1)
        : [];

    let weeks: { weekNumber: number; days: (number | null)[]; startDate: Date }[] = [];
    let week: (number | null)[] = [...daysFromPrevMonth.map((day) => -day)];
    let startDate = new Date(year, month, 1);
    let weekNumber = startDate.getWeekNumber();

    for (let day = 1; day <= lastDayOfMonth; day++) {
      if (week.length === 7) {
        weeks.push({ weekNumber, days: week, startDate });
        week = [];
        startDate = new Date(year, month, day).toBeginOfDay();
        weekNumber = startDate.getWeekNumber();
      }
      week.push(day);
    }

    if (week.length) {
      const remainingDaysInFirstWeek = 7 - week.length;
      if (remainingDaysInFirstWeek > 0) {
        const daysFromNextMonth = Array.from({ length: remainingDaysInFirstWeek }, (_, i) => i + 1);
        week.push(...daysFromNextMonth.map((day) => -day));
      }
      weeks.push({ weekNumber, days: week, startDate });
    }

    const showCalendar = this.state.display === 'calendar';

    return [
      <HorizontalStack key='header' className='header' gutter verticalItemAlignment='middle'>
        <Typography
          bold
          variant='label'
          content={`${this.props.value.toLocaleString('default', { month: 'short' })} ${year}`}
        />
        <Icon
          icon={showCalendar ? 'toolkit-angle-down' : 'toolkit-angle-up'}
          name={showCalendar ? 'Cacher le calendrier' : 'Afficher le calendrier'}
          onTap={() => this.onSwitchDisplay()}
        />
        <Spacer />
        <Icon
          disabled={month === 0 && year === yearRange[0]}
          icon='toolkit-angle-left'
          name="Reculer d'un mois"
          onTap={() => this.onChangeMonth(-1)}
        />
        <Icon
          disabled={month === 11 && year === yearRange[1]}
          icon='toolkit-angle-right'
          name="Avancer d'un mois"
          onTap={() => this.onChangeMonth(1)}
        />
      </HorizontalStack>,
      showCalendar && this.renderCalendar(weeks),
      !showCalendar && this.renderYears(year),
    ];
  }

  private renderCalendar(weeks: { weekNumber: number; days: (number | null)[]; startDate: Date }[]) {
    const selectedWeek = this.props.value.getWeekNumber();
    return (
      <VerticalStack key='calendar' className='calendar' fill>
        <HorizontalStack className='weekdays'>
          {['Se', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <HorizontalStack key={day} fill className='weekday' itemAlignment='center' verticalItemAlignment='middle'>
              <Typography alignment='center' variant='document' content={day} />
            </HorizontalStack>
          ))}
        </HorizontalStack>

        {weeks.map(({ weekNumber, days, startDate }, i) => {
          const weekLabel = `${weekNumber}`.padStart(2, '0');
          return (
            <HorizontalStack
              key={i}
              className={classNames('week', { selected: weekNumber === selectedWeek })}
              onTap={() => this.props.onChange(startDate, 'week')}
            >
              <HorizontalStack fill className='week-number' itemAlignment='center' verticalItemAlignment='middle'>
                <Typography alignment='center' variant='document' content={`S${weekLabel}`} />
              </HorizontalStack>
              {days.map((day, j) => {
                const disabled = !!day && day < 0;
                const dayAbs = Math.abs(day || 0);
                return (
                  <HorizontalStack
                    key={j}
                    fill
                    disabled={disabled}
                    className='day'
                    itemAlignment='center'
                    verticalItemAlignment='middle'
                  >
                    {!!dayAbs && <Typography alignment='center' variant='document' content={`${dayAbs}`} />}
                  </HorizontalStack>
                );
              })}
            </HorizontalStack>
          );
        })}
      </VerticalStack>
    );
  }

  private renderYears(selectedYear: number) {
    const [startYear, endYear] = this.props.yearRange!;
    const years: TJSXElementChild[] = [];

    for (let year = startYear; year <= endYear; year++) {
      years.push(
        <HorizontalStack
          key={year}
          colSpans={{
            small: 4,
            large: 3,
          }}
          fill
          className={classNames('year', { selected: year === selectedYear })}
          itemAlignment='center'
          verticalItemAlignment='middle'
        >
          <Typography alignment='center' variant='document' content={`${year}`} onTap={() => this.onChangeYear(year)} />
        </HorizontalStack>
      );
    }

    return (
      <Grid key='years' className='years' scroll>
        {years}
      </Grid>
    );
  }
}
