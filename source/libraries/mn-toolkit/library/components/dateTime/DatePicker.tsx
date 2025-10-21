import { TJSXElementChildren } from '../../system';
import { IContainerProps, Container, IContainerState, HorizontalStack } from '../container';
import { Icon } from '../icon';
import { DateInput } from './inputs';

export interface IDatePickerProps extends IContainerProps {
  inputId?: string;
  inputName?: string;
  popupTitle?: string;
  yearRange?: [number, number];
  canReset: boolean;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void | Promise<void>;
}

interface IDatePickerState extends IContainerState {
  focus: boolean;
}

export class DatePicker extends Container<IDatePickerProps, IDatePickerState> {
  public static override get defaultProps(): Omit<IDatePickerProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      gutter: true,
      paddingX: 'small',
      paddingY: 'tiny',
      verticalItemAlignment: 'middle',
      canReset: true,
    };
  }

  public constructor(props: IDatePickerProps) {
    super(props);
    this.state = {
      ...this.state,
      focus: false,
    };
  }

  private async showDatePicker(event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) {
    const date = await app.$dateTimePicker.pickDate(event, {
      defaultValue: this.props.value || new Date(),
      title: this.props.popupTitle,
      yearRange: this.props.yearRange,
    });
    if (date) await this.props.onChange(date);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-date-picker'] = true;
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
        onTap={!app.$device.isTouch ? undefined : (e) => this.showDatePicker(e)}
        onFocus={(e) => this.onFocus(e)}
        onBlur={(e) => this.onBlur(e)}
      >
        <DateInput
          disabled={app.$device.isTouch}
          inputId={this.props.inputId}
          inputName={this.props.inputName}
          fill={this.props.fill}
          canReset={this.props.canReset}
          value={this.props.value}
          onChange={(date) => this.props.onChange(date)}
        />
      </HorizontalStack>,
      !app.$device.isTouch && (
        <Icon
          key='icon-calendar'
          icon='toolkit-calendar'
          name='Choisir la date'
          onTap={(e) => this.showDatePicker(e)}
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
