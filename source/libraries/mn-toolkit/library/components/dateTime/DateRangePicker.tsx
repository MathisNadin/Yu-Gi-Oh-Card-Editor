import { TJSXElementChildren } from '../../system';
import { IContainerProps, Container, IContainerState } from '../container';
import { Icon } from '../icon';
import { DatePicker } from './DatePicker';

export interface IDateRange {
  lowerDate?: Date;
  higherDate?: Date;
}

export interface IDateRangePickerProps extends IContainerProps {
  lowerPopupTitle?: string;
  higherPopupTitle?: string;
  yearRange?: [number, number];
  canReset: boolean;
  value: IDateRange;
  onChange: (value: IDateRange) => void | Promise<void>;
}

interface IDateRangePickerState extends IContainerState {}

export class DateRangePicker extends Container<IDateRangePickerProps, IDateRangePickerState> {
  public static override get defaultProps(): Omit<IDateRangePickerProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      gutter: true,
      wrap: true,
      verticalItemAlignment: 'middle',
      lowerPopupTitle: 'Choisissez une date de début',
      higherPopupTitle: 'Choisissez une date de fin',
      canReset: true,
    };
  }

  private async onChangeLower(lowerDate: Date | undefined) {
    let higherDate = this.props.value.higherDate;
    if (higherDate && lowerDate && lowerDate > higherDate) {
      higherDate = lowerDate;
    }
    await this.props.onChange({ lowerDate, higherDate });
  }

  private async onChangeHigher(higherDate: Date | undefined) {
    let lowerDate = this.props.value.lowerDate;
    if (lowerDate && higherDate && higherDate < lowerDate) {
      lowerDate = higherDate;
    }
    await this.props.onChange({ lowerDate, higherDate });
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-date-range-picker'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    return [
      <DatePicker
        key='lower-date-picker'
        fill={this.props.fill}
        yearRange={this.props.yearRange}
        popupTitle={this.props.lowerPopupTitle}
        canReset={this.props.canReset}
        value={this.props.value.lowerDate}
        onChange={(lowerDate) => this.onChangeLower(lowerDate)}
      />,
      <Icon key='separator' icon='toolkit-minus' />,
      <DatePicker
        key='higher-date-picker'
        fill={this.props.fill}
        yearRange={this.props.yearRange}
        popupTitle={this.props.higherPopupTitle}
        canReset={this.props.canReset}
        value={this.props.value.higherDate}
        onChange={(higherDate) => this.onChangeHigher(higherDate)}
      />,
    ];
  }
}
