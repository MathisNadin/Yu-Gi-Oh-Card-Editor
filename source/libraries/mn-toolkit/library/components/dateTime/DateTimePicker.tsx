import { TJSXElementChildren } from '../../system';
import { TDidUpdateSnapshot } from '../containable';
import { IContainerProps, Container, IContainerState, HorizontalStack } from '../container';
import { Icon } from '../icon';
import { DateTimeInput } from './inputs';

export interface IDateTimePickerProps extends IContainerProps {
  popupTitle?: string;
  defaultValue?: Date;
  yearRange?: [number, number];
  canReset?: boolean;
  onChange?: (value: Date) => void | Promise<void>;
}

interface IDateTimePickerState extends IContainerState {
  focus: boolean;
  dateTime?: Date;
}

export class DateTimePicker extends Container<IDateTimePickerProps, IDateTimePickerState> {
  public static override get defaultProps(): IDateTimePickerProps {
    return {
      ...super.defaultProps,
      gutter: true,
      verticalItemAlignment: 'middle',
    };
  }

  public constructor(props: IDateTimePickerProps) {
    super(props);
    this.state = {
      ...this.state,
      focus: false,
      dateTime: props.defaultValue,
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IDateTimePickerProps>,
    prevState: Readonly<IDateTimePickerState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (this.props.defaultValue?.getTime() !== prevProps.defaultValue?.getTime()) {
      this.setState({ dateTime: this.props.defaultValue });
    }
  }

  private async onChange(dateTime: Date | undefined) {
    await this.setStateAsync({ dateTime });
    if (this.props.onChange) await this.props.onChange(dateTime!);
  }

  private async showDateTimePicker(event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) {
    const dateTime = await app.$dateTimePicker.pickDateTime(event, {
      defaultValue: this.state.dateTime,
      title: this.props.popupTitle,
      yearRange: this.props.yearRange,
    });
    if (dateTime) await this.onChange(dateTime);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-date-time-picker'] = true;
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
    const { dateTime } = this.state;
    return [
      <HorizontalStack
        key='input'
        fill={this.props.fill}
        onTap={!app.$device.isTouch ? undefined : (e) => this.showDateTimePicker(e)}
        onFocus={(e) => this.onFocus(e)}
        onBlur={(e) => this.onBlur(e)}
      >
        <DateTimeInput
          disabled={app.$device.isTouch}
          fill={this.props.fill}
          canReset={this.props.canReset}
          defaultValue={dateTime}
          onChange={(dateTime) => this.onChange(dateTime)}
        />
      </HorizontalStack>,
      !app.$device.isTouch && (
        <Icon key='icon-calendar' icon='toolkit-calendar' onTap={(e) => this.showDateTimePicker(e)} />
      ),
      app.$device.isTouch && this.props.canReset && (
        <Icon key='icon-delete' icon='toolkit-close' color='negative' onTap={() => this.onChange(undefined)} />
      ),
    ];
  }
}
