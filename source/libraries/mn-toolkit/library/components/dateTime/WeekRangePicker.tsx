import { TJSXElementChildren } from '../../system';
import { IContainerProps, Container, IContainerState } from '../container';
import { WeekPicker } from './WeekPicker';
import { Icon } from '../icon';

export interface IWeekRange {
  lowerWeek?: Date;
  higherWeek?: Date;
}

export interface IWeekRangePickerProps extends IContainerProps {
  lowerPopupTitle: string;
  higherPopupTitle: string;
  yearRange?: [number, number];
  canReset: boolean;
  value: IWeekRange;
  onChange: (value: IWeekRange) => void | Promise<void>;
}

interface IWeekRangePickerState extends IContainerState {}

export class WeekRangePicker extends Container<IWeekRangePickerProps, IWeekRangePickerState> {
  public static override get defaultProps(): Omit<IWeekRangePickerProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      gutter: true,
      wrap: true,
      verticalItemAlignment: 'middle',
      canReset: true,
      lowerPopupTitle: 'Choisissez une semaine de début',
      higherPopupTitle: 'Choisissez une semaine de fin',
    };
  }

  private async onChangeLower(lowerWeek: Date | undefined) {
    let higherWeek = this.props.value.higherWeek;
    if (higherWeek && lowerWeek && lowerWeek > higherWeek) {
      higherWeek = lowerWeek;
    }
    await this.props.onChange({ lowerWeek, higherWeek });
  }

  private async onChangeHigher(higherWeek: Date | undefined) {
    let lowerWeek = this.props.value.lowerWeek;
    if (lowerWeek && higherWeek && higherWeek < lowerWeek) {
      lowerWeek = higherWeek;
    }
    await this.props.onChange({ lowerWeek, higherWeek });
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-week-range-picker'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    return [
      <WeekPicker
        key='lower-week-picker'
        fill={this.props.fill}
        yearRange={this.props.yearRange}
        popupTitle={this.props.lowerPopupTitle}
        canReset={this.props.canReset}
        value={this.props.value.lowerWeek}
        onChange={(lowerWeek) => this.onChangeLower(lowerWeek)}
      />,
      <Icon key='separator' className='separator' icon='toolkit-minus' />,
      <WeekPicker
        key='higher-week-picker'
        fill={this.props.fill}
        yearRange={this.props.yearRange}
        popupTitle={this.props.higherPopupTitle}
        canReset={this.props.canReset}
        value={this.props.value.higherWeek}
        onChange={(higherWeek) => this.onChangeHigher(higherWeek)}
      />,
    ];
  }
}
