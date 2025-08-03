import { TJSXElementChildren } from '../../system';
import { IContainerProps, Container, IContainerState, HorizontalStack } from '../container';
import { Icon } from '../icon';
import { DateTimeInput } from './inputs';

export interface IDateTimePickerProps extends IContainerProps {
  popupTitle?: string;
  yearRange?: [number, number];
  canReset: boolean;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void | Promise<void>;
}

interface IDateTimePickerState extends IContainerState {
  focus: boolean;
  dateTime?: Date;
}

export class DateTimePicker extends Container<IDateTimePickerProps, IDateTimePickerState> {
  public static override get defaultProps(): Omit<IDateTimePickerProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      gutter: true,
      paddingX: 'small',
      paddingY: 'tiny',
      verticalItemAlignment: 'middle',
      canReset: true,
    };
  }

  public constructor(props: IDateTimePickerProps) {
    super(props);
    this.state = {
      ...this.state,
      focus: false,
    };
  }

  private async showDateTimePicker(event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) {
    const dateTime = await app.$dateTimePicker.pickDateTime(event, {
      defaultValue: this.props.value || new Date(),
      title: this.props.popupTitle,
      yearRange: this.props.yearRange,
    });
    if (dateTime) await this.props.onChange(dateTime);
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
          value={this.props.value}
          onChange={(dateTime) => this.props.onChange(dateTime)}
        />
      </HorizontalStack>,
      !app.$device.isTouch && (
        <Icon
          key='icon-calendar'
          icon='toolkit-calendar'
          name="Choisir la date et l'heure"
          onTap={(e) => this.showDateTimePicker(e)}
        />
      ),
      app.$device.isTouch && this.props.canReset && (
        <Icon
          key='icon-delete'
          icon='toolkit-close'
          color='negative'
          name='Réinitialiser'
          onTap={() => this.props.onChange(undefined)}
        />
      ),
    ];
  }
}
