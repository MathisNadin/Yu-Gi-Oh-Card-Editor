import { JSXElementChildren } from '../react';
import { TDidUpdateSnapshot } from '../containable';
import { IContainerProps, Container, IContainerState, HorizontalStack } from '../container';
import { Icon } from '../icon';
import { DateInput } from './inputs';

export interface IDatePickerProps extends IContainerProps {
  popupTitle?: string;
  defaultValue?: Date;
  yearRange?: [number, number];
  canReset?: boolean;
  onChange?: (value: Date) => void | Promise<void>;
}

interface IDatePickerState extends IContainerState {
  focus: boolean;
  date?: Date;
}

export class DatePicker extends Container<IDatePickerProps, IDatePickerState> {
  public static get defaultProps(): Partial<IDatePickerProps> {
    return {
      ...super.defaultProps,
      gutter: true,
      verticalItemAlignment: 'middle',
    };
  }

  public constructor(props: IDatePickerProps) {
    super(props);
    this.state = {
      ...this.state,
      focus: false,
      date: props.defaultValue,
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IDatePickerProps>,
    prevState: Readonly<IDatePickerState>,
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

  private async showDatePicker(event: React.MouseEvent) {
    const date = await app.$dateTimePicker.pickDate(event, {
      defaultValue: this.state.date,
      title: this.props.popupTitle,
      yearRange: this.props.yearRange,
    });
    if (date) await this.onChange(date);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-date-picker'] = true;
    classes['mn-focus'] = this.state.focus;
    return classes;
  }

  private async onFocus(event: React.FocusEvent) {
    await this.setStateAsync({ focus: true });
    if (this.props.onFocus) await this.props.onFocus(event);
  }

  private async onBlur(event: React.FocusEvent) {
    await this.setStateAsync({ focus: false });
    if (this.props.onBlur) await this.props.onBlur(event);
  }

  public override get children(): JSXElementChildren {
    const { date } = this.state;
    return [
      <HorizontalStack
        key='input'
        fill={this.props.fill}
        onTap={!app.$device.isTouch ? undefined : (e) => this.showDatePicker(e)}
        onFocus={(e) => this.onFocus(e)}
        onBlur={(e) => this.onBlur(e)}
      >
        <DateInput
          disabled={app.$device.isTouch}
          fill={this.props.fill}
          canReset={this.props.canReset}
          defaultValue={date}
          onChange={(date) => this.onChange(date)}
        />
      </HorizontalStack>,
      !app.$device.isTouch && (
        <Icon key='icon-calendar' icon='toolkit-calendar' onTap={(e) => this.showDatePicker(e)} />
      ),
      app.$device.isTouch && (
        <Icon key='icon-delete' icon='toolkit-close' color='negative' onTap={() => this.onChange(undefined)} />
      ),
    ];
  }
}
