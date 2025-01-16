import { TJSXElementChildren } from '../../system';
import { TDidUpdateSnapshot } from '../containable';
import { IContainerProps, Container, IContainerState, HorizontalStack } from '../container';
import { Icon } from '../icon';
import { TimeInput } from './inputs';

export interface ITimePickerProps extends IContainerProps {
  popupTitle?: string;
  defaultValue?: Date;
  canReset?: boolean;
  onChange?: (value: Date) => void | Promise<void>;
}

interface ITimePickerState extends IContainerState {
  focus: boolean;
  time?: Date;
}

export class TimePicker extends Container<ITimePickerProps, ITimePickerState> {
  public static override get defaultProps(): ITimePickerProps {
    return {
      ...super.defaultProps,
      gutter: true,
      verticalItemAlignment: 'middle',
    };
  }

  public constructor(props: ITimePickerProps) {
    super(props);
    this.state = {
      ...this.state,
      focus: false,
      time: props.defaultValue,
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<ITimePickerProps>,
    prevState: Readonly<ITimePickerState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (this.props.defaultValue?.getTime() !== prevProps.defaultValue?.getTime()) {
      this.setState({ time: this.props.defaultValue });
    }
  }

  private async onChange(time: Date | undefined) {
    await this.setStateAsync({ time });
    if (this.props.onChange) await this.props.onChange(time!);
  }

  private async showTimePicker(event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) {
    const time = await app.$dateTimePicker.pickTime(event, {
      defaultValue: this.state.time,
      title: this.props.popupTitle,
    });
    if (time) await this.onChange(time);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-time-picker'] = true;
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
    const { time } = this.state;
    return [
      <HorizontalStack
        key='input'
        fill={this.props.fill}
        onTap={!app.$device.isTouch ? undefined : (e) => this.showTimePicker(e)}
        onFocus={(e) => this.onFocus(e)}
        onBlur={(e) => this.onBlur(e)}
      >
        <TimeInput
          disabled={app.$device.isTouch}
          fill={this.props.fill}
          canReset={this.props.canReset}
          defaultValue={time}
          onChange={(time) => this.onChange(time)}
        />
      </HorizontalStack>,
      !app.$device.isTouch && <Icon key='icon-calendar' icon='toolkit-time' onTap={(e) => this.showTimePicker(e)} />,
      app.$device.isTouch && (
        <Icon key='icon-delete' icon='toolkit-close' color='negative' onTap={() => this.onChange(undefined)} />
      ),
    ];
  }
}
