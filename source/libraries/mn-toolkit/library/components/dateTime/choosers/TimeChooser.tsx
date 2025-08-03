import { classNames } from 'mn-tools';
import { TJSXElementChild, TJSXElementChildren } from '../../../system';
import { IContainerProps, Container, IContainerState, VerticalStack, Grid } from '../../container';
import { Typography } from '../../typography';
import { TDidUpdateSnapshot } from '../../containable';

export type TTimeChooserChangeSource = 'minute' | 'hour';

export interface ITimeChooserProps extends IContainerProps {
  mode: 'scroller' | 'grid';
  value: Date;
  onChange: (value: Date, source: TTimeChooserChangeSource) => void | Promise<void>;
}

interface ITimeChooserState extends IContainerState {}

export class TimeChooser extends Container<ITimeChooserProps, ITimeChooserState> {
  public static override get defaultProps(): Omit<ITimeChooserProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      gutter: false,
      fill: true,
      scroll: false,
      maxWidth: '100%',
      maxHeight: '100%',
      mode: 'scroller',
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    this.scrollToSelectedHour('instant');
    this.scrollToSelectedMinute('instant');
  }

  public componentDidUpdate(
    prevProps: Readonly<ITimeChooserProps>,
    prevState: Readonly<ITimeChooserState>,
    snapshot?: TDidUpdateSnapshot
  ): void {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps.value !== this.props.value) {
      this.scrollToSelectedHour();
    }
  }

  private scrollToSelectedHour(behavior: ScrollBehavior = 'smooth') {
    if (this.props.mode === 'grid') return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (!this.base.current) return;

        const hoursContainer = this.base.current.querySelector('.hours-container');
        if (!hoursContainer) return;

        const selectedHourElement = hoursContainer.querySelector('.hour.selected');
        if (!selectedHourElement) return;

        const containerTop = hoursContainer.getBoundingClientRect().top;
        const selectedTop = selectedHourElement.getBoundingClientRect().top;

        // Calculate the offset position to scroll to
        const offset = selectedTop - containerTop + hoursContainer.scrollTop;

        hoursContainer.scrollTo({
          top: offset,
          behavior,
        });
      })
    );
  }

  private scrollToSelectedMinute(behavior: ScrollBehavior = 'smooth') {
    if (this.props.mode === 'grid') return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (!this.base.current) return;

        const minutesContainer = this.base.current.querySelector('.minutes-container');
        if (!minutesContainer) return;

        const selectedMinuteElement = minutesContainer.querySelector('.minute.selected');
        if (!selectedMinuteElement) return;

        const containerTop = minutesContainer.getBoundingClientRect().top;
        const selectedTop = selectedMinuteElement.getBoundingClientRect().top;

        // Calculate the offset position to scroll to
        const offset = selectedTop - containerTop + minutesContainer.scrollTop;

        minutesContainer.scrollTo({
          top: offset,
          behavior,
        });
      })
    );
  }

  private async onChooseHour(hour: number) {
    const time = new Date(this.props.value);
    time.setHours(hour);
    await this.props.onChange(time, 'hour');
  }

  private async onChooseMinute(minute: number) {
    const time = new Date(this.props.value);
    time.setMinutes(minute);
    await this.props.onChange(time, 'minute');
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-time-chooser'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    const selectedHour = this.props.value.getHours();
    const selectedMinute = this.props.value.getMinutes();

    if (this.props.mode === 'grid') {
      return [
        <VerticalStack
          key='hours'
          className={classNames('hours', this.props.mode)}
          fill
          gutter
          paddingX='small'
          itemAlignment='center'
        >
          <Typography variant='label' content='HEURES' />
          <Grid className='hours-container'>{this.renderHours(selectedHour)}</Grid>
        </VerticalStack>,

        <VerticalStack
          key='minutes'
          className={classNames('minutes', this.props.mode)}
          fill
          gutter
          paddingX='small'
          itemAlignment='center'
        >
          <Typography variant='label' content='MINUTES' />
          <Grid className='minutes-container'>{this.renderMinutes(selectedMinute)}</Grid>
        </VerticalStack>,
      ];
    } else {
      return [
        <VerticalStack key='hours' className={classNames('hours', this.props.mode)} fill paddingX='small'>
          <VerticalStack className='hours-container' scroll>
            {this.renderHours(selectedHour)}
          </VerticalStack>
        </VerticalStack>,

        <VerticalStack key='minutes' className={classNames('minutes', this.props.mode)} fill paddingX='small'>
          <VerticalStack className='minutes-container' scroll>
            {this.renderMinutes(selectedMinute)}
          </VerticalStack>
        </VerticalStack>,
      ];
    }
  }

  private renderHours(selectedHour: number) {
    const hours: TJSXElementChild[] = [];
    for (let hour = 0; hour < 24; hour++) {
      hours.push(
        <VerticalStack
          key={hour}
          colSpans={{
            small: 4,
            large: 3,
          }}
          fill
          className={classNames('hour', { selected: hour === selectedHour })}
          itemAlignment='center'
          verticalItemAlignment='middle'
        >
          <Typography alignment='center' variant='document' content={`${hour}`} onTap={() => this.onChooseHour(hour)} />
        </VerticalStack>
      );
    }
    return hours;
  }

  private renderMinutes(selectedMinute: number) {
    const minutes: TJSXElementChild[] = [];
    for (let minute = 0; minute < 60; minute += 5) {
      let minuteString = `${minute}`;
      if (minuteString.length === 1) minuteString = `0${minuteString}`;
      minutes.push(
        <VerticalStack
          key={minute}
          colSpans={{
            small: 4,
            large: 3,
          }}
          fill
          className={classNames('minute', { selected: minute === selectedMinute })}
          itemAlignment='center'
          verticalItemAlignment='middle'
        >
          <Typography
            alignment='center'
            variant='document'
            content={minuteString}
            onTap={() => this.onChooseMinute(minute)}
          />
        </VerticalStack>
      );
    }
    return minutes;
  }
}
