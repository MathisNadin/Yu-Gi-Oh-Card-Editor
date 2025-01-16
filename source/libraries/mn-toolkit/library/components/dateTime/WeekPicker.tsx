import { TJSXElementChildren } from '../../system';
import { TDidUpdateSnapshot } from '../containable';
import { IContainerProps, Container, IContainerState, HorizontalStack } from '../container';
import { WeekInput } from './inputs';
import { Icon } from '../icon';

export interface IWeekPickerProps extends IContainerProps {
  popupTitle?: string;
  defaultValue?: Date;
  yearRange?: [number, number];
  canReset?: boolean;
  onChange?: (value: Date) => void | Promise<void>;
}

interface IWeekPickerState extends IContainerState {
  focus: boolean;
  date?: Date;
}

export class WeekPicker extends Container<IWeekPickerProps, IWeekPickerState> {
  public static override get defaultProps(): IWeekPickerProps {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      gutter: true,
      verticalItemAlignment: 'middle',
    };
  }

  public constructor(props: IWeekPickerProps) {
    super(props);
    this.state = {
      ...this.state,
      focus: false,
      date: props.defaultValue,
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IWeekPickerProps>,
    prevState: Readonly<IWeekPickerState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (this.props.defaultValue?.getTime() !== prevProps.defaultValue?.getTime()) {
      this.setState({ date: this.props.defaultValue });
    }
  }

  private async onChange(date: Date | undefined) {
    await this.setStateAsync({ date });
    if (this.props.onChange) await this.props.onChange(date!);
  }

  private async showWeekPicker(event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) {
    const date = await app.$dateTimePicker.pickWeek(event, {
      defaultValue: this.state.date,
      title: this.props.popupTitle,
      yearRange: this.props.yearRange,
    });
    if (date) await this.onChange(date);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-week-picker'] = true;
    classes['mn-focus'] = this.state.focus;
    return classes;
  }

  private async onFocus(event: React.FocusEvent<HTMLDivElement>) {
    await this.setStateAsync({ focus: true });
    if (this.props.onFocus) await this.props.onFocus(event);
  }

  private async onBlur(event: React.FocusEvent<HTMLDivElement>) {
    await this.setStateAsync({ focus: false });
    if (this.props.onBlur) await this.props.onBlur(event);
  }

  public override get children(): TJSXElementChildren {
    const { date } = this.state;
    return [
      <HorizontalStack
        key='input'
        fill={this.props.fill}
        onTap={!app.$device.isTouch ? undefined : (e) => this.showWeekPicker(e)}
        onFocus={(e) => this.onFocus(e)}
        onBlur={(e) => this.onBlur(e)}
      >
        <WeekInput
          disabled={app.$device.isTouch}
          fill={this.props.fill}
          canReset={this.props.canReset}
          defaultValue={date}
          onChange={(date) => this.onChange(date)}
        />
      </HorizontalStack>,
      !app.$device.isTouch && (
        <Icon key='toolkit-calendar' icon='toolkit-calendar' onTap={(e) => this.showWeekPicker(e)} />
      ),
      app.$device.isTouch && this.props.canReset && (
        <Icon key='toolkit-close' icon='toolkit-close' color='negative' onTap={() => this.onChange(undefined)} />
      ),
    ];
  }
}
