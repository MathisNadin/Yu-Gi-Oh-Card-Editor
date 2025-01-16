import { classNames } from 'mn-tools';
import { TJSXElementChild, TJSXElementChildren } from '../../../system';
import { TDidUpdateSnapshot } from '../../containable';
import { IContainerProps, Container, IContainerState, VerticalStack, Grid } from '../../container';
import { Typography } from '../../typography';

export interface ITimeChooserProps extends IContainerProps {
  mode?: 'scroller' | 'grid';
  defaultValue?: Date;
  onChoose?: (value: Date) => void | Promise<void>;
}

interface ITimeChooserState extends IContainerState {
  time: Date;
}

export class TimeChooser extends Container<ITimeChooserProps, ITimeChooserState> {
  public static override get defaultProps(): ITimeChooserProps {
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

  public constructor(props: ITimeChooserProps) {
    super(props);
    this.state = {
      ...this.state,
      time: props.defaultValue || new Date(),
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    this.scrollToSelectedHour('instant');
    this.scrollToSelectedMinute('instant');
  }

  public override componentDidUpdate(
    prevProps: Readonly<ITimeChooserProps>,
    prevState: Readonly<ITimeChooserState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps.defaultValue?.getTime() !== this.props.defaultValue?.getTime()) {
      this.setState({ time: this.props.defaultValue || new Date() });
      this.scrollToSelectedHour();
      this.scrollToSelectedMinute();
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
    const time = new Date(this.state.time);
    time.setHours(hour);
    await this.setStateAsync({ time });
    this.scrollToSelectedHour();
    if (this.props.onChoose) this.props.onChoose(time);
  }

  private async onChooseMinute(minute: number) {
    const time = new Date(this.state.time);
    time.setMinutes(minute);
    await this.setStateAsync({ time });
    this.scrollToSelectedMinute();
    if (this.props.onChoose) this.props.onChoose(time);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-time-chooser'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    const { time } = this.state;
    const selectedHour = time.getHours();
    const selectedMinute = time.getMinutes();

    if (this.props.mode === 'grid') {
      return [
        <VerticalStack key='hours' className={classNames('hours', this.props.mode)} fill gutter itemAlignment='center'>
          <Typography variant='label' content='HEURES' />
          <Grid className='hours-container'>{this.renderHours(selectedHour)}</Grid>
        </VerticalStack>,

        <VerticalStack
          key='minutes'
          className={classNames('minutes', this.props.mode)}
          fill
          gutter
          itemAlignment='center'
        >
          <Typography variant='label' content='MINUTES' />
          <Grid className='minutes-container'>{this.renderMinutes(selectedMinute)}</Grid>
        </VerticalStack>,
      ];
    } else {
      return [
        <VerticalStack key='hours' className={classNames('hours', this.props.mode)} fill>
          <VerticalStack className='hours-container' scroll>
            {this.renderHours(selectedHour)}
          </VerticalStack>
        </VerticalStack>,

        <VerticalStack key='minutes' className={classNames('minutes', this.props.mode)} fill>
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
          s='4'
          m='4'
          l='3'
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
          s='4'
          m='4'
          l='3'
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
