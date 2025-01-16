import { TJSXElementChildren } from '../../system';
import { TDidUpdateSnapshot } from '../containable';
import { IContainerProps, Container, IContainerState } from '../container';
import { WeekPicker } from './WeekPicker';
import { Icon } from '../icon';

export interface IWeekRange {
  lowerWeek?: Date;
  higherWeek?: Date;
}

export interface IWeekRangePickerProps extends IContainerProps {
  lowerPopupTitle?: string;
  higherPopupTitle?: string;
  defaultValue?: IWeekRange;
  yearRange?: [number, number];
  canReset?: boolean;
  onChange?: (value: IWeekRange) => void | Promise<void>;
}

interface IWeekRangePickerState extends IContainerState {
  weekRange: IWeekRange;
}

export class WeekRangePicker extends Container<IWeekRangePickerProps, IWeekRangePickerState> {
  public static override get defaultProps(): IWeekRangePickerProps {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      gutter: true,
      wrap: true,
      verticalItemAlignment: 'middle',
      lowerPopupTitle: 'Choisissez une semaine de début',
      higherPopupTitle: 'Choisissez une semaine de fin',
      defaultValue: { lowerWeek: undefined, higherWeek: undefined },
    };
  }

  public constructor(props: IWeekRangePickerProps) {
    super(props);
    this.state = {
      ...this.state,
      weekRange: props.defaultValue || { lowerWeek: undefined, higherWeek: undefined },
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IWeekRangePickerProps>,
    prevState: Readonly<IWeekRangePickerState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (
      this.props.defaultValue !== this.state.weekRange ||
      this.props.defaultValue?.lowerWeek?.getTime() !== this.state.weekRange.lowerWeek?.getTime() ||
      this.props.defaultValue?.higherWeek?.getTime() !== this.state.weekRange.higherWeek?.getTime()
    ) {
      this.setState({ weekRange: this.props.defaultValue || { lowerWeek: undefined, higherWeek: undefined } });
    }
  }

  private async onChangeLower(lowerWeek: Date) {
    const weekRange = { ...this.state.weekRange, lowerWeek };
    if (weekRange.higherWeek && lowerWeek > weekRange.higherWeek) {
      weekRange.higherWeek = new Date(lowerWeek);
    }
    await this.setStateAsync({ weekRange });
    if (this.props.onChange) await this.props.onChange(weekRange);
  }

  private async onChangeHigher(higherWeek: Date) {
    const weekRange = { ...this.state.weekRange, higherWeek };
    if (weekRange.lowerWeek && higherWeek < weekRange.lowerWeek) {
      weekRange.lowerWeek = new Date(higherWeek);
    }
    await this.setStateAsync({ weekRange });
    if (this.props.onChange) await this.props.onChange(weekRange);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-week-range-picker'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    const { lowerWeek, higherWeek } = this.state.weekRange;
    return [
      <WeekPicker
        key='lower-week-picker'
        fill={this.props.fill}
        yearRange={this.props.yearRange}
        popupTitle={this.props.lowerPopupTitle}
        canReset={this.props.canReset}
        defaultValue={lowerWeek}
        onChange={(lowerWeek) => this.onChangeLower(lowerWeek)}
      />,
      <Icon key='separator' className='separator' icon='toolkit-minus' />,
      <WeekPicker
        key='higher-week-picker'
        fill={this.props.fill}
        yearRange={this.props.yearRange}
        popupTitle={this.props.higherPopupTitle}
        canReset={this.props.canReset}
        defaultValue={higherWeek}
        onChange={(higherWeek) => this.onChangeHigher(higherWeek)}
      />,
    ];
  }
}
