import { TJSXElementChildren } from '../../system';
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
  yearRange?: [number, number];
  canReset: boolean;
  value: IDateTimeRange;
  onChange: (value: IDateTimeRange) => void | Promise<void>;
}

interface IDateTimeRangePickerState extends IContainerState {}

export class DateTimeRangePicker extends Container<IDateTimeRangePickerProps, IDateTimeRangePickerState> {
  public static override get defaultProps(): Omit<IDateTimeRangePickerProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      gutter: true,
      wrap: true,
      verticalItemAlignment: 'middle',
      lowerPopupTitle: 'Choisissez une date et une heure de début',
      higherPopupTitle: 'Choisissez une date et une heure de fin',
      canReset: true,
    };
  }

  private async onChangeLower(lowerDateTime: Date | undefined) {
    let higherDateTime = this.props.value.higherDateTime;
    if (higherDateTime && lowerDateTime && lowerDateTime > higherDateTime) {
      higherDateTime = lowerDateTime;
    }
    await this.props.onChange({ lowerDateTime, higherDateTime });
  }

  private async onChangeHigher(higherDateTime: Date | undefined) {
    let lowerDateTime = this.props.value.lowerDateTime;
    if (lowerDateTime && higherDateTime && higherDateTime < lowerDateTime) {
      lowerDateTime = higherDateTime;
    }
    await this.props.onChange({ lowerDateTime, higherDateTime });
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-date-time-range-picker'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    return [
      <DateTimePicker
        key='lower-date-time-picker'
        fill={this.props.fill}
        yearRange={this.props.yearRange}
        popupTitle={this.props.lowerPopupTitle}
        canReset={this.props.canReset}
        value={this.props.value.lowerDateTime}
        onChange={(lowerDateTime) => this.onChangeLower(lowerDateTime)}
      />,
      <Icon key='separator' icon='toolkit-minus' />,
      <DateTimePicker
        key='higher-date-time-picker'
        fill={this.props.fill}
        yearRange={this.props.yearRange}
        popupTitle={this.props.higherPopupTitle}
        canReset={this.props.canReset}
        value={this.props.value.higherDateTime}
        onChange={(higherDateTime) => this.onChangeHigher(higherDateTime)}
      />,
    ];
  }
}
