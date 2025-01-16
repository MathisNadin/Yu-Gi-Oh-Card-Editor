import { TJSXElementChildren } from '../../system';
import { TDidUpdateSnapshot } from '../containable';
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
  defaultValue?: IDateRange;
  yearRange?: [number, number];
  canReset?: boolean;
  onChange?: (value: IDateRange) => void | Promise<void>;
}

interface IDateRangePickerState extends IContainerState {
  dateRange: IDateRange;
}

export class DateRangePicker extends Container<IDateRangePickerProps, IDateRangePickerState> {
  public static override get defaultProps(): IDateRangePickerProps {
    return {
      ...super.defaultProps,
      gutter: true,
      wrap: true,
      verticalItemAlignment: 'middle',
      lowerPopupTitle: 'Choisissez une date de début',
      higherPopupTitle: 'Choisissez une date de fin',
      defaultValue: { lowerDate: undefined, higherDate: undefined },
    };
  }

  public constructor(props: IDateRangePickerProps) {
    super(props);
    this.state = {
      ...this.state,
      dateRange: props.defaultValue || { lowerDate: undefined, higherDate: undefined },
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IDateRangePickerProps>,
    prevState: Readonly<IDateRangePickerState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (
      this.props.defaultValue !== this.state.dateRange ||
      this.props.defaultValue?.lowerDate?.getTime() !== this.state.dateRange.lowerDate?.getTime() ||
      this.props.defaultValue?.higherDate?.getTime() !== this.state.dateRange.higherDate?.getTime()
    ) {
      this.setState({ dateRange: this.props.defaultValue || { lowerDate: undefined, higherDate: undefined } });
    }
  }

  private async onChangeLower(lowerDate: Date) {
    const dateRange = { ...this.state.dateRange, lowerDate };
    if (dateRange.higherDate && lowerDate > dateRange.higherDate) {
      dateRange.higherDate = new Date(lowerDate);
    }
    await this.setStateAsync({ dateRange });
    if (this.props.onChange) await this.props.onChange(dateRange);
  }

  private async onChangeHigher(higherDate: Date) {
    const dateRange = { ...this.state.dateRange, higherDate };
    if (dateRange.lowerDate && higherDate < dateRange.lowerDate) {
      dateRange.lowerDate = new Date(higherDate);
    }
    await this.setStateAsync({ dateRange });
    if (this.props.onChange) await this.props.onChange(dateRange);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-date-range-picker'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    const { lowerDate, higherDate } = this.state.dateRange;
    return [
      <DatePicker
        key='lower-date-picker'
        fill={this.props.fill}
        yearRange={this.props.yearRange}
        popupTitle={this.props.lowerPopupTitle}
        canReset={this.props.canReset}
        defaultValue={lowerDate}
        onChange={(lowerDate) => this.onChangeLower(lowerDate)}
      />,
      <Icon key='separator' icon='toolkit-minus' />,
      <DatePicker
        key='higher-date-picker'
        fill={this.props.fill}
        yearRange={this.props.yearRange}
        popupTitle={this.props.higherPopupTitle}
        canReset={this.props.canReset}
        defaultValue={higherDate}
        onChange={(higherDate) => this.onChangeHigher(higherDate)}
      />,
    ];
  }
}
