import { TJSXElementChildren } from '../../system';
import { IContainerProps, Container, IContainerState, HorizontalStack } from '../container';
import { WeekInput } from './inputs';
import { Icon } from '../icon';

export interface IWeekPickerProps extends IContainerProps {
  popupTitle?: string;
  yearRange?: [number, number];
  canReset: boolean;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void | Promise<void>;
}

interface IWeekPickerState extends IContainerState {
  focus: boolean;
}

export class WeekPicker extends Container<IWeekPickerProps, IWeekPickerState> {
  public static override get defaultProps(): Omit<IWeekPickerProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      gutter: true,
      paddingX: 'small',
      paddingY: 'tiny',
      verticalItemAlignment: 'middle',
      canReset: true,
    };
  }

  public constructor(props: IWeekPickerProps) {
    super(props);
    this.state = {
      ...this.state,
      focus: false,
    };
  }

  private async showWeekPicker(event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) {
    const date = await app.$dateTimePicker.pickWeek(event, {
      defaultValue: this.props.value || new Date(),
      title: this.props.popupTitle,
      yearRange: this.props.yearRange,
    });
    if (date) await this.props.onChange(date);
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
          value={this.props.value}
          onChange={(date) => this.props.onChange(date)}
        />
      </HorizontalStack>,
      !app.$device.isTouch && (
        <Icon
          key='toolkit-calendar'
          icon='toolkit-calendar'
          name='Choisir la semaine'
          onTap={(e) => this.showWeekPicker(e)}
        />
      ),
      app.$device.isTouch && this.props.canReset && (
        <Icon
          key='toolkit-close'
          icon='toolkit-close'
          color='negative'
          name='Réinitialiser'
          onTap={() => this.props.onChange(undefined)}
        />
      ),
    ];
  }
}
