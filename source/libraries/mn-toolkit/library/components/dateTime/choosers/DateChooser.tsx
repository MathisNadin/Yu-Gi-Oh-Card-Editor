import { classNames, isDefined } from 'mn-tools';
import { TJSXElementChild, TJSXElementChildren } from '../../../system';
import { TDidUpdateSnapshot } from '../../containable';
import { IContainerProps, Container, IContainerState, HorizontalStack, VerticalStack, Grid } from '../../container';
import { Spacer } from '../../spacer';
import { Typography } from '../../typography';
import { Icon } from '../../icon';

export interface IDateChooserProps extends IContainerProps {
  defaultValue?: Date;
  yearRange?: [number, number];
  onChoose?: (value: Date) => void | Promise<void>;
}

interface IDateChooserState extends IContainerState {
  date: Date;
  display: 'calendar' | 'years';
  height: string;
}

export class DateChooser extends Container<IDateChooserProps, IDateChooserState> {
  public static override get defaultProps(): IDateChooserProps {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      gutter: true,
      maxWidth: '100%',
      maxHeight: '100%',
      yearRange: [1900, 2100],
    };
  }

  public constructor(props: IDateChooserProps) {
    super(props);
    this.state = {
      ...this.state,
      date: props.defaultValue || new Date(),
      display: 'calendar',
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    if (!this.base.current?.clientHeight) return;
    this.setState({ height: `${this.base.current.clientHeight}px` });
  }

  public override componentDidUpdate(
    prevProps: Readonly<IDateChooserProps>,
    prevState: Readonly<IDateChooserState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps.defaultValue?.getTime() !== this.props.defaultValue?.getTime()) {
      this.setState({ date: this.props.defaultValue || new Date() });
    }
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
    const date = new Date(this.state.date);
    date.setFullYear(year);

    const lastDayOfNewMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    if (date.getDate() > lastDayOfNewMonth) {
      date.setDate(lastDayOfNewMonth);
    }

    await this.setStateAsync({ date, display: 'calendar' });
  }

  private async onChangeMonth(offset: number) {
    const date = new Date(this.state.date);
    date.setMonth(date.getMonth() + offset);

    const lastDayOfNewMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    if (date.getDate() > lastDayOfNewMonth) {
      date.setDate(lastDayOfNewMonth);
    }

    await this.setStateAsync({ date });
  }

  private async onChooseDay(day: number) {
    const date = new Date(this.state.date);
    date.setDate(day);
    await this.setStateAsync({ date });
    if (this.props.onChoose) this.props.onChoose(date);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-date-chooser'] = true;
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
    const { date, display } = this.state;
    const month = date.getMonth();
    const year = date.getFullYear();
    const selectedDay = date.getDate();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    const startDayOffset = (firstDayOfMonth - Date.getFirstDayOfWeek() + 7) % 7;

    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const daysFromPrevMonth =
      startDayOffset > 0
        ? Array.from({ length: startDayOffset }, (_, i) => daysInPrevMonth - startDayOffset + i + 1)
        : [];

    const endDayOffset = (7 - ((lastDayOfMonth + startDayOffset) % 7)) % 7;
    const daysFromNextMonth = Array.from({ length: endDayOffset }, (_, i) => i + 1);

    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = [...daysFromPrevMonth.map((day) => -day)];

    for (let day = 1; day <= lastDayOfMonth; day++) {
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
      week.push(day);
    }

    if (week.length) {
      week.push(...daysFromNextMonth.map((day) => -day));
      weeks.push(week);
    }

    const showCalendar = display === 'calendar';

    return [
      <HorizontalStack key='header' className='header' gutter verticalItemAlignment='middle'>
        <Typography bold variant='label' content={`${date.toLocaleString('default', { month: 'short' })} ${year}`} />
        <Icon icon={showCalendar ? 'toolkit-angle-down' : 'toolkit-angle-up'} onTap={() => this.onSwitchDisplay()} />
        <Spacer />
        <Icon
          disabled={month === 0 && year === yearRange[0]}
          icon='toolkit-angle-left'
          onTap={() => this.onChangeMonth(-1)}
        />
        <Icon
          disabled={month === 11 && year === yearRange[1]}
          icon='toolkit-angle-right'
          onTap={() => this.onChangeMonth(1)}
        />
      </HorizontalStack>,
      showCalendar && this.renderCalendar(selectedDay, weeks),
      !showCalendar && this.renderYears(year),
    ];
  }

  private renderCalendar(selectedDay: number, weeks: (number | null)[][]) {
    return (
      <VerticalStack key='calendar' className='calendar' scroll>
        <HorizontalStack className='weekdays'>
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <HorizontalStack key={day} fill className='weekday' itemAlignment='center' verticalItemAlignment='middle'>
              <Typography alignment='center' variant='document' content={day} />
            </HorizontalStack>
          ))}
        </HorizontalStack>

        {weeks.map((week, i) => (
          <HorizontalStack key={i} className='week'>
            {week.map((day, j) => {
              const disabled = !!day && day < 0;
              const dayAbs = Math.abs(day || 0);
              return (
                <HorizontalStack
                  key={j}
                  fill
                  disabled={disabled}
                  className={classNames('day', { selected: dayAbs === selectedDay })}
                  itemAlignment='center'
                  verticalItemAlignment='middle'
                >
                  {!!day && (
                    <Typography
                      alignment='center'
                      variant='document'
                      content={`${dayAbs}`}
                      onTap={disabled ? undefined : () => this.onChooseDay(dayAbs)}
                    />
                  )}
                </HorizontalStack>
              );
            })}
          </HorizontalStack>
        ))}
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
          s='4'
          m='4'
          l='3'
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
