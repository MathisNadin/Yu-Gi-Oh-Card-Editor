import { JSXElementChildren } from '../react';
import { TDidUpdateSnapshot } from '../containable';
import { IContainerProps, Container, IContainerState } from '../container';
import { Icon } from '../icon';
import { DateTimePicker } from './DateTimePicker';

export interface IDateTimeRange {
  lowerDateTime?: Date;
  higherDateTime?: Date;
}

export interface IDateTimeRangePickerProps extends IContainerProps {
  lowerPopupTitle?: string;
  higherPopupTitle?: string;
  defaultValue?: IDateTimeRange;
  yearRange?: [number, number];
  canReset?: boolean;
  onChange?: (value: IDateTimeRange) => void | Promise<void>;
}

interface IDateTimeRangePickerState extends IContainerState {
  dateTimeRange: IDateTimeRange;
}

export class DateTimeRangePicker extends Container<IDateTimeRangePickerProps, IDateTimeRangePickerState> {
  public static get defaultProps(): Partial<IDateTimeRangePickerProps> {
    return {
      ...super.defaultProps,
      gutter: true,
      wrap: true,
      verticalItemAlignment: 'middle',
      lowerPopupTitle: 'Choisissez une date et une heure de début',
      higherPopupTitle: 'Choisissez une date et une heure de fin',
      defaultValue: { lowerDateTime: undefined, higherDateTime: undefined },
    };
  }

  public constructor(props: IDateTimeRangePickerProps) {
    super(props);
    this.state = {
      ...this.state,
      dateTimeRange: props.defaultValue || { lowerDateTime: undefined, higherDateTime: undefined },
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IDateTimeRangePickerProps>,
    prevState: Readonly<IDateTimeRangePickerState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (
      this.props.defaultValue !== this.state.dateTimeRange ||
      this.props.defaultValue?.lowerDateTime?.getTime() !== this.state.dateTimeRange.lowerDateTime?.getTime() ||
      this.props.defaultValue?.higherDateTime?.getTime() !== this.state.dateTimeRange.higherDateTime?.getTime()
    ) {
      this.setState({
        dateTimeRange: this.props.defaultValue || { lowerDateTime: undefined, higherDateTime: undefined },
      });
    }
  }

  private async onChangeLower(lowerDateTime: Date) {
    const dateTimeRange = { ...this.state.dateTimeRange, lowerDateTime };
    if (dateTimeRange.higherDateTime && lowerDateTime > dateTimeRange.higherDateTime) {
      dateTimeRange.higherDateTime = new Date(lowerDateTime);
    }
    await this.setStateAsync({ dateTimeRange });
    if (this.props.onChange) await this.props.onChange(dateTimeRange);
  }

  private async onChangeHigher(higherDateTime: Date) {
    const dateTimeRange = { ...this.state.dateTimeRange, higherDateTime };
    if (dateTimeRange.lowerDateTime && higherDateTime < dateTimeRange.lowerDateTime) {
      dateTimeRange.lowerDateTime = new Date(higherDateTime);
    }
    await this.setStateAsync({ dateTimeRange });
    if (this.props.onChange) await this.props.onChange(dateTimeRange);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-date-time-range-picker'] = true;
    return classes;
  }

  public override get children(): JSXElementChildren {
    const { lowerDateTime, higherDateTime } = this.state.dateTimeRange;
    return [
      <DateTimePicker
        key='lower-date-time-picker'
        fill={this.props.fill}
        yearRange={this.props.yearRange}
        popupTitle={this.props.lowerPopupTitle}
        canReset={this.props.canReset}
        defaultValue={lowerDateTime}
        onChange={(lowerDateTime) => this.onChangeLower(lowerDateTime)}
      />,
      <Icon key='separator' icon='toolkit-minus' />,
      <DateTimePicker
        key='higher-date-time-picker'
        fill={this.props.fill}
        yearRange={this.props.yearRange}
        popupTitle={this.props.higherPopupTitle}
        canReset={this.props.canReset}
        defaultValue={higherDateTime}
        onChange={(higherDateTime) => this.onChangeHigher(higherDateTime)}
      />,
    ];
  }
}
